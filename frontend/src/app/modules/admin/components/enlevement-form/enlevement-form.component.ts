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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { EnlevementService } from '../../../../services/enlevement.service';
import { SocieteService } from '../../../../services/societe.service';
import { SiteService } from '../../../../services/site.service';
import { CreateEnlevementRequest, TypeDechet, SousTypeRecyclable } from '../../../../models/enlevement.model';
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
    MatSnackBarModule,
    MatProgressSpinnerModule
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
  societePredefinie: number | null = null;

  // Enums pour les selects
  typesDechet = Object.values(TypeDechet);
  sousTypesRecyclable = Object.values(SousTypeRecyclable);

  constructor(
    private fb: FormBuilder,
    private enlevementService: EnlevementService,
    private societeService: SocieteService,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Vérifier si une société est passée en paramètre
    this.route.queryParams.subscribe(params => {
      if (params['societeId']) {
        this.societePredefinie = +params['societeId'];
      }
    });
    
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
      uniteMesure: ['kg'], // Par défaut "kg"
      etat: [''], // État du déchet
      prixUnitaireMad: [0, [Validators.required, Validators.min(0)]]
    });

    // Observer les changements de typeDechet pour rendre sousType obligatoire si VALORISABLE ou A_DETRUIRE
    itemForm.get('typeDechet')?.valueChanges.subscribe(type => {
      const sousTypeControl = itemForm.get('sousType');
      if (type === 'VALORISABLE' || type === 'A_DETRUIRE') {
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
        
        // Si une société est pré-définie, la pré-remplir et désactiver le champ
        if (this.societePredefinie) {
          const societeControl = this.step1Form.get('societeId');
          if (societeControl) {
            societeControl.setValue(this.societePredefinie);
            societeControl.disable();
            // Charger les sites de cette société
            this.loadSites(this.societePredefinie);
          }
        }
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
          // Sélectionner automatiquement le site s'il n'y en a qu'un
          const siteControl = this.step1Form.get('siteId');
          if (siteControl) {
            siteControl.setValue(sites[0].id);
            siteControl.markAsTouched();
            siteControl.updateValueAndValidity();
          }
        } else if (sites.length > 1 && !this.step1Form.get('siteId')?.value) {
          // Réinitialiser le site si plusieurs sites disponibles et aucun sélectionné
          this.step1Form.get('siteId')?.setValue('');
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
    
    let budgetRecyclage = 0;
    let budgetTraitement = 0;
    let poidsTotal = 0;
    let poidsRecyclable = 0;

    items.forEach((item: any) => {
      const montant = this.calculateMontant(item);
      poidsTotal += item.quantiteKg || 0;

      if (item.typeDechet === 'RECYCLABLE') {
        budgetRecyclage += montant;
        poidsRecyclable += item.quantiteKg || 0;
      } else {
        budgetTraitement += montant;
      }
    });

    const bilanNet = budgetRecyclage - budgetTraitement;
    const tauxRecyclage = poidsTotal > 0 ? (poidsRecyclable / poidsTotal) * 100 : 0;

    return {
      poidsTotal,
      budgetRecyclage,
      budgetTraitement,
      bilanNet,
      tauxRecyclage
    };
  }

  onSubmit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    // Utiliser getRawValue() pour récupérer toutes les valeurs, y compris celles des champs désactivés
    const formValue = this.step1Form.getRawValue();

    // Réactiver les champs désactivés pour la validation
    const societeControl = this.step1Form.get('societeId');
    if (societeControl?.disabled) {
      societeControl.enable();
    }

    const siteControl = this.step1Form.get('siteId');
    if (siteControl?.disabled) {
      siteControl.enable();
    }

    const dateEnlevement = formValue.dateEnlevement;
    const formattedDate = dateEnlevement instanceof Date 
      ? dateEnlevement.toISOString().split('T')[0]
      : dateEnlevement;

    // Vérifier que siteId est bien défini
    if (!formValue.siteId) {
      this.snackBar.open('Veuillez sélectionner un site', 'Fermer', { duration: 3000 });
      this.loading = false;
      return;
    }

    const request: CreateEnlevementRequest = {
      dateEnlevement: formattedDate,
      siteId: formValue.siteId,
      societeId: formValue.societeId,
      observation: formValue.observation,
      items: this.itemsFormArray.value.map((item: any) => ({
        typeDechet: item.typeDechet,
        sousType: item.sousType || null,
        quantiteKg: item.quantiteKg,
        uniteMesure: item.uniteMesure || 'kg',
        etat: item.etat || null,
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
      case 'RECYCLABLE': return '🔄 Recyclable';
      case 'BANAL': return '🗑️ Banal';
      case 'A_DETRUIRE': return '☣️ A détruire';
      default: return type;
    }
  }
}
