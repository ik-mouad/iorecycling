import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { VenteService } from '../../../../services/vente.service';
import { SocieteService } from '../../../../services/societe.service';
import { 
  CreateVenteRequest, 
  CreateVenteItemRequest,
  StockDisponible 
} from '../../../../models/vente.model';
import { Societe } from '../../../../models/societe.model';

/**
 * Composant : Formulaire de création de vente
 */
@Component({
  selector: 'app-vente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatTooltipModule
  ],
  templateUrl: './vente-form.component.html',
  styleUrls: ['./vente-form.component.scss']
})
export class VenteFormComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  loading = false;
  societes: Societe[] = [];
  stocksDisponibles: StockDisponible[] = [];
  stocksLoading = false;

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private societeService: SocieteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSocietes();
    
    // Vérifier les query params pour pré-remplir
    this.route.queryParams.subscribe(params => {
      if (params['pickupItemId']) {
        this.loadStocksDisponibles();
      }
    });
  }

  initForms(): void {
    this.step1Form = this.fb.group({
      dateVente: [new Date(), Validators.required],
      acheteurId: [null],
      acheteurNom: [''],
      observation: ['']
    });

    this.step2Form = this.fb.group({
      items: this.fb.array([this.createItemFormGroup()])
    });
  }

  get itemsFormArray(): FormArray {
    return this.step2Form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.fb.group({
      pickupItemId: [null],
      typeDechet: ['', Validators.required],
      sousType: [''],
      quantiteVendueKg: [0, [Validators.required, Validators.min(0.01)]],
      prixVenteUnitaireMad: [0, [Validators.required, Validators.min(0.01)]]
    });
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
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
      },
      error: (err) => {
        console.error('Erreur chargement sociétés:', err);
      }
    });
  }

  loadStocksDisponibles(): void {
    this.stocksLoading = true;
    const societeId = this.step1Form.get('acheteurId')?.value;
    
    this.venteService.getStocksDisponibles(
      societeId || undefined
    ).subscribe({
      next: (stocks) => {
        this.stocksDisponibles = stocks;
        this.stocksLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement stocks:', err);
        this.stocksLoading = false;
      }
    });
  }

  onSocieteChange(): void {
    this.loadStocksDisponibles();
  }

  selectStockFromList(stock: StockDisponible, itemIndex: number): void {
    const itemForm = this.itemsFormArray.at(itemIndex);
    itemForm.patchValue({
      pickupItemId: stock.pickupItemId,
      typeDechet: stock.typeDechet,
      sousType: stock.sousType || '',
      quantiteVendueKg: Math.min(stock.resteAVendreKg, stock.resteAVendreKg)
    });
  }

  calculateMontantVente(item: any): number {
    return (item.quantiteVendueKg || 0) * (item.prixVenteUnitaireMad || 0);
  }

  calculateTotal(): number {
    return this.itemsFormArray.value.reduce((total: number, item: any) => {
      return total + this.calculateMontantVente(item);
    }, 0);
  }

  onSubmit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    const dateVente = this.step1Form.value.dateVente;
    const formattedDate = dateVente instanceof Date 
      ? dateVente.toISOString().split('T')[0]
      : dateVente;

    const request: CreateVenteRequest = {
      dateVente: formattedDate,
      acheteurId: this.step1Form.value.acheteurId || undefined,
      acheteurNom: this.step1Form.value.acheteurNom || undefined,
      observation: this.step1Form.value.observation || undefined,
      items: this.itemsFormArray.value.map((item: any) => ({
        pickupItemId: item.pickupItemId || undefined,
        typeDechet: item.typeDechet,
        sousType: item.sousType || undefined,
        quantiteVendueKg: item.quantiteVendueKg,
        prixVenteUnitaireMad: item.prixVenteUnitaireMad
      }))
    };

    this.venteService.createVente(request).subscribe({
      next: (vente) => {
        this.snackBar.open(
          `Vente ${vente.numeroVente} créée avec succès`, 
          'Fermer', 
          { duration: 5000 }
        );
        this.router.navigate(['/admin/ventes']);
      },
      error: (error) => {
        console.error('Erreur création vente:', error);
        this.snackBar.open('Erreur lors de la création de la vente', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/ventes']);
  }
}
