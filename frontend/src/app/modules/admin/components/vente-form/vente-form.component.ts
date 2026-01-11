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
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { VenteService } from '../../../../services/vente.service';
import { SocieteService } from '../../../../services/societe.service';
import { 
  CreateVenteRequest, 
  CreateVenteItemRequest,
  StockDisponible,
  Vente
} from '../../../../models/vente.model';
import { Societe } from '../../../../models/societe.model';
import { I18nService } from '../../../../services/i18n.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

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
    MatTooltipModule,
    MatChipsModule,
    TranslatePipe
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
  
  // Mode consultation/édition
  venteId?: number;
  isViewMode = false;
  currentVente?: Vente;
  
  // Base path pour les routes (admin ou comptable)
  private basePath: string = '/admin/ventes';

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private societeService: SocieteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable/ventes';
    } else {
      this.basePath = '/admin/ventes';
    }
    
    this.initForms();
    this.loadSocietes();
    
    // Vérifier si on est en mode consultation/édition (ID dans l'URL)
    // Utiliser snapshot.params pour la détection immédiate
    const routeId = this.route.snapshot.params['id'];
    if (routeId) {
      this.venteId = +routeId;
      this.isViewMode = true; // Mode consultation (read-only)
      this.loadVente(this.venteId);
    }
    
    // Écouter aussi les changements de paramètres (pour la navigation)
    this.route.params.subscribe(params => {
      if (params['id'] && +params['id'] !== this.venteId) {
        this.venteId = +params['id'];
        this.isViewMode = true;
        this.loadVente(this.venteId);
      }
    });
    
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

  loadVente(id: number): void {
    this.loading = true;
    this.venteService.getVenteById(id).subscribe({
      next: (vente) => {
        this.currentVente = vente;
        this.populateForm(vente);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement vente:', err);
        this.snackBar.open(this.i18n.t('errors.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
        this.router.navigate([this.basePath]);
      }
    });
  }

  populateForm(vente: Vente): void {
    // Remplir le formulaire étape 1
    const dateVente = new Date(vente.dateVente);
    this.step1Form.patchValue({
      dateVente: dateVente,
      acheteurId: vente.acheteurId || null,
      acheteurNom: vente.acheteurNom || '',
      observation: vente.observation || ''
    });

    // Désactiver les champs en mode consultation
    if (this.isViewMode) {
      this.step1Form.disable();
    }

    // Remplir le formulaire étape 2 avec les items
    this.itemsFormArray.clear();
    if (vente.items && vente.items.length > 0) {
      vente.items.forEach(item => {
        const itemForm = this.fb.group({
          pickupItemId: [item.pickupItemId || null],
          typeDechet: [item.typeDechet, Validators.required],
          sousType: [item.sousType || ''],
          quantiteVendueKg: [item.quantiteVendueKg, [Validators.required, Validators.min(0.01)]],
          prixVenteUnitaireMad: [item.prixVenteUnitaireMad, [Validators.required, Validators.min(0.01)]]
        });
        
        // Désactiver les champs en mode consultation
        if (this.isViewMode) {
          itemForm.disable();
        }
        
        this.itemsFormArray.push(itemForm);
      });
    } else {
      // Si pas d'items, créer un item vide
      this.itemsFormArray.push(this.createItemFormGroup());
    }

    // Désactiver le formulaire étape 2 en mode consultation
    if (this.isViewMode) {
      this.step2Form.disable();
    }
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
    // En mode consultation, utiliser les montants réels de la vente
    if (this.isViewMode && this.currentVente && this.currentVente.items) {
      return this.currentVente.items.reduce((total, item) => {
        return total + (item.montantVenteMad || 0);
      }, 0);
    }
    
    // Sinon, calculer depuis le formulaire
    return this.itemsFormArray.value.reduce((total: number, item: any) => {
      return total + this.calculateMontantVente(item);
    }, 0);
  }

  onSubmit(): void {
    // En mode consultation, ne rien faire
    if (this.isViewMode) {
      return;
    }

    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.snackBar.open(this.i18n.t('errors.formErrors'), this.i18n.t('common.close'), { duration: 3000 });
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
        this.router.navigate([this.basePath]);
      },
      error: (error) => {
        console.error('Erreur création vente:', error);
        this.snackBar.open(this.i18n.t('ventes.createError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate([this.basePath]);
  }

  // Helper methods for view mode
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'BROUILLON': this.i18n.t('ventes.statuts.brouillon'),
      'VALIDEE': this.i18n.t('ventes.statuts.validee'),
      'ANNULEE': this.i18n.t('ventes.statuts.annulee')
    };
    return labels[statut] || statut;
  }

  getTypeDechetLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'RECYCLABLE': this.i18n.t('ventes.recyclable'),
      'BANAL': this.i18n.t('ventes.banal'),
      'A_DETRUIRE': this.i18n.t('ventes.aDetruire')
    };
    return labels[type] || type;
  }

  getSocieteName(societeId: number): string {
    const societe = this.societes.find(s => s.id === societeId);
    return societe ? societe.raisonSociale : 'N/A';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '-';
    const d = new Date(dateTime);
    return d.toLocaleString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFormattedReste(stock: StockDisponible): string {
    return (stock.resteAVendreKg || 0).toFixed(3);
  }

  getFormattedTotal(): string {
    return this.calculateTotal().toFixed(2);
  }
}
