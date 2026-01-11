import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { CamionService } from '../../../../services/camion.service';
import { DestinationService } from '../../../../services/destination.service';
import { CreateEnlevementRequest, TypeDechet, SousTypeRecyclable } from '../../../../models/enlevement.model';
import { Societe, Site } from '../../../../models/societe.model';
import { Camion } from '../../../../models/camion.model';
import { Destination, TypeTraitement } from '../../../../models/destination.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

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
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  providers: [DecimalPipe],
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
  camions: Camion[] = [];
  camionsLoading = false;
  destinations: Destination[] = [];
  destinationsLoading = false;
  hasDechetsDangereux = false;
  loading = false;
  societePredefinie: number | null = null;
  poidsTotal = 0;
  tonnageMaxCamion: number | null = null;

  // Enums pour les selects
  typesDechet = Object.values(TypeDechet);
  sousTypesRecyclable = Object.values(SousTypeRecyclable);

  constructor(
    private fb: FormBuilder,
    private enlevementService: EnlevementService,
    private societeService: SocieteService,
    private siteService: SiteService,
    private camionService: CamionService,
    private destinationService: DestinationService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private i18n: I18nService,
    private decimalPipe: DecimalPipe
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
    this.loadCamions();
    this.loadDestinations();
  }

  loadCamions(): void {
    this.camionsLoading = true;
    this.camionService.getActiveCamions().subscribe({
      next: (camions) => {
        this.camions = camions;
        this.camionsLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement camions:', error);
        this.camionsLoading = false;
      }
    });
  }

  loadDestinations(): void {
    this.destinationsLoading = true;
    this.destinationService.getAllDestinations(0, 100).subscribe({
      next: (page) => {
        this.destinations = page.content;
        this.destinationsLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement destinations:', error);
        this.destinationsLoading = false;
      }
    });
  }

  loadDestinationsPourDechetsDangereux(): void {
    this.destinationsLoading = true;
    const compatibleTypes: TypeTraitement[] = [
      TypeTraitement.INCINERATION,
      TypeTraitement.ENFOUISSEMENT,
      TypeTraitement.DENATURATION_DESTRUCTION,
      TypeTraitement.TRAITEMENT
    ];
    this.destinationService.getDestinationsByTreatmentTypes(compatibleTypes).subscribe({
      next: (destinations: Destination[]) => {
        this.destinations = destinations;
        this.destinationsLoading = false;
        // Si la destination actuellement sélectionnée n'est plus compatible, la réinitialiser
        const currentDestinationId = this.step1Form.get('destinationId')?.value;
        if (currentDestinationId && !destinations.some((d: Destination) => d.id === currentDestinationId)) {
          this.step1Form.get('destinationId')?.setValue('');
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement destinations compatibles:', error);
        this.destinationsLoading = false;
      }
    });
  }

  initForms(): void {
    // Étape 1 : Informations générales
    this.step1Form = this.fb.group({
      dateEnlevement: [new Date(), Validators.required],
      heureEnlevement: [''], // Format HH:mm
      dateDestination: [''], // Date optionnelle
      heureDestination: [''], // Format HH:mm
      societeId: ['', Validators.required],
      siteId: ['', Validators.required],
      observation: [''],
      camionId: [''],
      chauffeurNom: [''],
      destinationId: ['']
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

    // Observer les changements de camion pour vérifier le tonnage
    this.step1Form.get('camionId')?.valueChanges.subscribe(camionId => {
      if (camionId) {
        const camion = this.camions.find(c => c.id === camionId);
        this.tonnageMaxCamion = camion ? camion.tonnageMaxKg : null;
        this.checkTonnage();
      } else {
        this.tonnageMaxCamion = null;
      }
    });

    // Observer les changements dans les items pour calculer le poids total et vérifier les déchets dangereux
    this.step2Form.get('items')?.valueChanges.subscribe(() => {
      this.calculatePoidsTotal();
      this.checkTonnage();
      this.checkDechetsDangereux();
    });
  }

  checkDechetsDangereux(): void {
    const items = this.itemsFormArray.value;
    this.hasDechetsDangereux = items.some((item: any) => item.typeDechet === 'A_DETRUIRE');
    
    // Si des déchets dangereux sont présents, charger uniquement les destinations compatibles
    if (this.hasDechetsDangereux) {
      this.loadDestinationsPourDechetsDangereux();
      
      // Rendre la destination obligatoire
      const destinationControl = this.step1Form.get('destinationId');
      if (destinationControl) {
        destinationControl.setValidators([Validators.required]);
        destinationControl.updateValueAndValidity();
      }
    } else {
      // Charger toutes les destinations
      this.loadDestinations();
      
      // Rendre la destination optionnelle
      const destinationControl = this.step1Form.get('destinationId');
      if (destinationControl) {
        destinationControl.clearValidators();
        destinationControl.updateValueAndValidity();
      }
    }
  }

  calculatePoidsTotal(): void {
    const items = this.itemsFormArray.value;
    this.poidsTotal = items.reduce((sum: number, item: any) => sum + (item.quantiteKg || 0), 0);
  }

  checkTonnage(): void {
    if (this.tonnageMaxCamion && this.poidsTotal > this.tonnageMaxCamion) {
      // Afficher un warning (non bloquant)
      console.warn(`Attention : Le poids total (${this.poidsTotal} kg) dépasse le tonnage maximum du camion (${this.tonnageMaxCamion} kg)`);
    }
  }

  get itemsFormArray(): FormArray {
    return this.step2Form.get('items') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    const itemForm = this.fb.group({
      typeDechet: ['RECYCLABLE', Validators.required],
      sousType: [''],
      quantiteKg: [0, [Validators.required, Validators.min(0)]],
      uniteMesure: ['kg'], // Par défaut "kg"
      etat: [''], // État du déchet
      prixUnitaireMad: [0, [Validators.required, Validators.min(0)]],
      // NOUVEAUX CHAMPS - Prestation (tous types)
      prixPrestationMad: [0, [Validators.min(0)]],
      // NOUVEAUX CHAMPS - Achat (valorisable)
      prixAchatMad: [0, [Validators.min(0)]],
      // NOUVEAUX CHAMPS - Traitement (banal)
      prixTraitementMad: [0, [Validators.min(0)]]
    });

    // Observer les changements de typeDechet pour rendre sousType obligatoire si RECYCLABLE ou A_DETRUIRE
    itemForm.get('typeDechet')?.valueChanges.subscribe(type => {
      const sousTypeControl = itemForm.get('sousType');
      if (type === 'RECYCLABLE' || type === 'A_DETRUIRE') {
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
        this.snackBar.open(this.i18n.t('errors.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.sitesLoading = false;
      }
    });
  }

  calculateMontant(item: any): number {
    return (item.quantiteKg || 0) * (item.prixUnitaireMad || 0);
  }

  calculateMontantPrestation(item: any): number {
    return (item.quantiteKg || 0) * (item.prixPrestationMad || 0);
  }

  calculateMontantAchat(item: any): number {
    return (item.quantiteKg || 0) * (item.prixAchatMad || 0);
  }

  calculateMontantTraitement(item: any): number {
    return (item.quantiteKg || 0) * (item.prixTraitementMad || 0);
  }

  calculateTotaux(): any {
    const items = this.itemsFormArray.value;
    
    let totalPrestation = 0;
    let totalAchat = 0;
    let totalTraitement = 0;
    let budgetRecyclage = 0;
    let budgetTraitement = 0;
    let poidsTotal = 0;
    let poidsRecyclable = 0;

    items.forEach((item: any) => {
      const montant = this.calculateMontant(item);
      const montantPrestation = this.calculateMontantPrestation(item);
      const montantAchat = this.calculateMontantAchat(item);
      const montantTraitement = this.calculateMontantTraitement(item);
      
      poidsTotal += item.quantiteKg || 0;
      totalPrestation += montantPrestation;

      if (item.typeDechet === 'RECYCLABLE') {
        budgetRecyclage += montant;
        totalAchat += montantAchat;
        poidsRecyclable += item.quantiteKg || 0;
      } else {
        budgetTraitement += montant;
        totalTraitement += montantTraitement;
      }
    });

    const bilanNet = totalPrestation - totalAchat - totalTraitement;
    const tauxRecyclage = poidsTotal > 0 ? (poidsRecyclable / poidsTotal) * 100 : 0;

    return {
      poidsTotal,
      totalPrestation,
      totalAchat,
      totalTraitement,
      budgetRecyclage,
      budgetTraitement,
      bilanNet,
      tauxRecyclage
    };
  }

  onSubmit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      this.snackBar.open(this.i18n.t('errors.formErrors'), this.i18n.t('common.close'), { duration: 3000 });
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

    // Formater l'heure d'enlèvement (format HH:mm -> HH:mm:ss)
    const heureEnlevement = formValue.heureEnlevement 
      ? (formValue.heureEnlevement.length === 5 ? formValue.heureEnlevement + ':00' : formValue.heureEnlevement)
      : undefined;

    // Formater la date de destination
    const dateDestination = formValue.dateDestination instanceof Date
      ? formValue.dateDestination.toISOString().split('T')[0]
      : formValue.dateDestination || undefined;

    // Formater l'heure de destination (format HH:mm -> HH:mm:ss)
    const heureDestination = formValue.heureDestination
      ? (formValue.heureDestination.length === 5 ? formValue.heureDestination + ':00' : formValue.heureDestination)
      : undefined;

    // Vérifier que siteId est bien défini
    if (!formValue.siteId) {
      this.snackBar.open(this.i18n.t('enlevement.siteRequired'), this.i18n.t('common.close'), { duration: 3000 });
      this.loading = false;
      return;
    }

    const request: CreateEnlevementRequest = {
      dateEnlevement: formattedDate,
      heureEnlevement: heureEnlevement,
      dateDestination: dateDestination,
      heureDestination: heureDestination,
      siteId: formValue.siteId,
      societeId: formValue.societeId,
      observation: formValue.observation,
      camionId: formValue.camionId || undefined,
      chauffeurNom: formValue.chauffeurNom || undefined,
      destinationId: formValue.destinationId || undefined,
      items: this.itemsFormArray.value.map((item: any) => ({
        typeDechet: item.typeDechet,
        sousType: item.sousType || null,
        quantiteKg: item.quantiteKg,
        uniteMesure: item.uniteMesure || 'kg',
        etat: item.etat || null,
        prixUnitaireMad: item.prixUnitaireMad,
        prixPrestationMad: item.prixPrestationMad || null,
        prixAchatMad: item.prixAchatMad || null,
        prixTraitementMad: item.prixTraitementMad || null
      }))
    };

    this.enlevementService.createEnlevement(request).subscribe({
      next: (enlevement) => {
        this.snackBar.open(
          this.i18n.t('enlevement.createdSuccess', { numero: enlevement.numeroEnlevement }), 
          this.i18n.t('common.close'), 
          { duration: 5000 }
        );
        this.router.navigate(['/admin/enlevements']);
      },
      error: (error) => {
        console.error('Erreur création enlèvement:', error);
        this.snackBar.open(this.i18n.t('errors.generic'), this.i18n.t('common.close'), { duration: 3000 });
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

  getCamionMatricule(camionId: number): string {
    const camion = this.camions.find(c => c.id === camionId);
    return camion ? camion.matricule : '';
  }

  getDestinationNom(destinationId: number): string {
    const destination = this.destinations.find(d => d.id === destinationId);
    return destination ? `${destination.raisonSociale} - ${destination.site}` : '';
  }

  getTypeDechetLabel(type: string): string {
    switch (type) {
      case 'RECYCLABLE': return this.i18n.t('enlevement.typeRecyclable');
      case 'BANAL': return this.i18n.t('enlevement.typeBanal');
      case 'A_DETRUIRE': return this.i18n.t('enlevement.typeADetruire');
      default: return type;
    }
  }

  getFormattedPoidsTotal(): string {
    return this.decimalPipe.transform(this.poidsTotal, '1.2-2') ?? '0.00';
  }

  getFormattedTonnageMax(): string {
    return this.decimalPipe.transform(this.tonnageMaxCamion ?? 0, '1.0-0') ?? '0';
  }
}
