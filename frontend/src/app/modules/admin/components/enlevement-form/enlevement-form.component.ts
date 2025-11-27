import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EnlevementService } from '../../../../services/enlevement.service';
import { SocieteService } from '../../../../services/societe.service';
import { SiteService } from '../../../../services/site.service';
import { CreateEnlevementRequest, TypeDechet, SousTypeValorisable } from '../../../../models/enlevement.model';
import { Societe, Site } from '../../../../models/societe.model';

/**
 * Composant : Formulaire de création d'enlèvement (multi-étapes)
 * Étape 1 : Informations générales
 * Étape 2 : Items (lignes de détail)
 * Étape 3 : Récapitulatif
 */
@Component({
  selector: 'app-enlevement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './enlevement-form.component.html',
  styleUrls: ['./enlevement-form.component.scss']
})
export class EnlevementFormComponent implements OnInit {
  // Formulaires multi-étapes
  step1Form!: FormGroup; // Informations générales
  step2Form!: FormGroup; // Items

  societes: Societe[] = [];
  sites: Site[] = [];
  sitesLoading = false;
  loading = false;

  // Enums pour les selects
  typesDechet = Object.values(TypeDechet);
  sousTypesValorisable = Object.values(SousTypeValorisable);

  constructor(
    private fb: FormBuilder,
    private enlevementService: EnlevementService,
    private societeService: SocieteService,
    private siteService: SiteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSocietes();
  }

  initForms(): void {
    // Étape 1 : Informations générales
    this.step1Form = this.fb.group({
      dateEnlevement: [new Date(), Validators.required],
      societeId: ['', Validators.required],
      siteId: ['', Validators.required],
      observation: ['']
    });

    // Étape 2 : Items
    this.step2Form = this.fb.group({
      items: this.fb.array([this.createItemFormGroup()])
    });

    // Observer les changements de société pour charger les sites
    this.step1Form.get('societeId')?.valueChanges.subscribe(societeId => {
      if (societeId) {
        this.loadSites(societeId);
      }
    });
  }

  get itemsFormArray(): FormArray {
    return this.step2Form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    const itemForm = this.fb.group({
      typeDechet: ['VALORISABLE', Validators.required],
      sousType: [''],
      quantiteKg: [0, [Validators.required, Validators.min(0)]],
      prixUnitaireMad: [0, [Validators.required, Validators.min(0)]]
    });

    // Observer les changements de typeDechet pour rendre sousType obligatoire si VALORISABLE
    itemForm.get('typeDechet')?.valueChanges.subscribe(type => {
      const sousTypeControl = itemForm.get('sousType');
      if (type === 'VALORISABLE') {
        sousTypeControl?.setValidators([Validators.required]);
        sousTypeControl?.updateValueAndValidity();
      } else {
        sousTypeControl?.clearValidators();
        sousTypeControl?.setValue('');
        sousTypeControl?.updateValueAndValidity();
      }
    });

    return itemForm;
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 100).subscribe({
      next: (page) => {
        this.societes = page.content;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés:', error);
      }
    });
  }

  loadSites(societeId: number): void {
    const id = Number(societeId);
    if (!id || isNaN(id)) {
      this.sites = [];
      this.step1Form.get('siteId')?.setValue('');
      return;
    }

    this.sitesLoading = true;
    this.sites = [];
    this.step1Form.get('siteId')?.setValue('');

    this.siteService.getSitesBySociete(id).subscribe({
      next: (sites) => {
        this.sites = sites;
        this.sitesLoading = false;
        if (sites.length === 1) {
          this.step1Form.get('siteId')?.setValue(sites[0].id);
        }
      },
      error: (error) => {
        console.error('Erreur chargement sites:', error);
        this.snackBar.open('Impossible de charger les sites de la société sélectionnée', 'Fermer', { duration: 3000 });
        this.sitesLoading = false;
      }
    });
  }

  calculateMontant(item: any): number {
    return (item.quantiteKg || 0) * (item.prixUnitaireMad || 0);
  }

  calculateTotaux(): any {
    const items = this.itemsFormArray.value;
    
    let budgetValorisation = 0;
    let budgetTraitement = 0;
    let poidsTotal = 0;
    let poidsValorisable = 0;

    items.forEach((item: any) => {
      const montant = this.calculateMontant(item);
      poidsTotal += item.quantiteKg || 0;

      if (item.typeDechet === 'VALORISABLE') {
        budgetValorisation += montant;
        poidsValorisable += item.quantiteKg || 0;
      } else {
        budgetTraitement += montant;
      }
    });

    const bilanNet = budgetValorisation - budgetTraitement;
    const tauxValorisation = poidsTotal > 0 ? (poidsValorisable / poidsTotal) * 100 : 0;

    return {
      poidsTotal,
      budgetValorisation,
      budgetTraitement,
      bilanNet,
      tauxValorisation
    };
  }

  onSubmit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    const dateEnlevement = this.step1Form.value.dateEnlevement;
    const formattedDate = dateEnlevement instanceof Date 
      ? dateEnlevement.toISOString().split('T')[0]
      : dateEnlevement;

    const request: CreateEnlevementRequest = {
      dateEnlevement: formattedDate,
      siteId: this.step1Form.value.siteId,
      societeId: this.step1Form.value.societeId,
      observation: this.step1Form.value.observation,
      items: this.itemsFormArray.value.map((item: any) => ({
        typeDechet: item.typeDechet,
        sousType: item.sousType || null,
        quantiteKg: item.quantiteKg,
        prixUnitaireMad: item.prixUnitaireMad
      }))
    };

    this.enlevementService.createEnlevement(request).subscribe({
      next: (enlevement) => {
        this.snackBar.open(
          `Enlèvement ${enlevement.numeroEnlevement} créé avec succès`, 
          'Fermer', 
          { duration: 5000 }
        );
        this.router.navigate(['/admin/enlevements']);
      },
      error: (error) => {
        console.error('Erreur création enlèvement:', error);
        this.snackBar.open('Erreur lors de la création de l\'enlèvement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/enlevements']);
  }

  getSocieteNom(societeId: number): string {
    return this.societes.find(s => s.id === societeId)?.raisonSociale || '';
  }

  getSiteNom(siteId: number): string {
    return this.sites.find(s => s.id === siteId)?.name || '';
  }

  getTypeDechetLabel(type: string): string {
    switch (type) {
      case 'VALORISABLE': return '🔄 Valorisable';
      case 'BANAL': return '🗑️ Banal';
      case 'A_ELIMINER': return '☣️ A éliminer';
      default: return type;
    }
  }
}
