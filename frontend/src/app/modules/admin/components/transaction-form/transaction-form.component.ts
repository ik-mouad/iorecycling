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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { SocieteService } from '../../../../services/societe.service';
import { EnlevementService } from '../../../../services/enlevement.service';
import { CasbinService } from '../../../../services/casbin.service';
import { 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TypeTransaction,
  CreateEcheanceRequest,
  Transaction
} from '../../../../models/comptabilite.model';
import { Societe } from '../../../../models/societe.model';
import { Enlevement } from '../../../../models/enlevement.model';
import { AddPaiementDialogComponent } from '../add-paiement-dialog/add-paiement-dialog.component';

/**
 * Composant : Formulaire de création/édition de transaction
 */
@Component({
  selector: 'app-transaction-form',
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
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEditMode = false;
  isViewMode = false; // Mode consultation (lecture seule)
  transactionId?: number;
  loading = false;
  societes: Societe[] = [];
  enlevements: Enlevement[] = [];
  typeFixe = false; // Indique si le type est fixe (passé en paramètre)
  currentTransaction?: Transaction; // Transaction chargée pour la consultation
  isComptable = false; // Indique si l'utilisateur est comptable
  
  // Base path pour les routes (admin ou comptable)
  basePath: string = '/admin/comptabilite'; // Public pour le template

  constructor(
    private fb: FormBuilder,
    private comptabiliteService: ComptabiliteService,
    private societeService: SocieteService,
    private enlevementService: EnlevementService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private casbinService: CasbinService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable';
    } else {
      this.basePath = '/admin/comptabilite';
    }
    
    // Vérifier si l'utilisateur est comptable
    this.isComptable = this.casbinService.isComptable();
    
    this.initForm();
    this.loadSocietes();
    
    // Vérifier si on est en mode consultation, édition ou création
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.transactionId = +params['id'];
        // Vérifier si on est en mode édition (URL contient /edit) ou consultation
        const url = this.router.url;
        if (url.includes('/edit')) {
          this.isEditMode = true;
          this.isViewMode = false;
        } else {
          this.isViewMode = true; // Mode consultation par défaut
          this.isEditMode = false;
        }
        this.loadTransaction();
      }
    });

    // Vérifier les query params pour pré-remplir le formulaire
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.transactionForm.patchValue({ type: params['type'] });
        this.typeFixe = true; // Le type est fixe, on désactive le champ
        this.transactionForm.get('type')?.disable();
      }
      if (params['societeId']) {
        this.transactionForm.patchValue({ societeId: +params['societeId'] });
        this.onSocieteChange(+params['societeId']);
      }
    });
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      type: ['RECETTE', Validators.required],
      montant: [null, [Validators.required, Validators.min(0.01)]],
      dateTransaction: [new Date(), Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      categorie: ['', Validators.maxLength(100)],
      numeroReference: ['', Validators.maxLength(50)],
      societeId: [null, Validators.required],
      enlevementId: [null],
      notes: ['', Validators.maxLength(1000)],
      hasEcheances: [false],
      echeances: this.fb.array([])
    });
  }

  get echeancesFormArray(): FormArray {
    return this.transactionForm.get('echeances') as FormArray;
  }

  addEcheance(): void {
    const echeanceGroup = this.fb.group({
      montant: [null, [Validators.required, Validators.min(0.01)]],
      dateEcheance: [null, Validators.required]
    });
    this.echeancesFormArray.push(echeanceGroup);
  }

  removeEcheance(index: number): void {
    this.echeancesFormArray.removeAt(index);
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sociétés', err);
      }
    });
  }

  onSocieteChange(societeId: number): void {
    if (societeId) {
      this.enlevementService.getEnlevements(societeId, 0, 100).subscribe({
        next: (page) => {
          this.enlevements = page.content;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des enlèvements', err);
        }
      });
    }
  }

  loadTransaction(): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.comptabiliteService.getTransactionById(this.transactionId).subscribe({
      next: (transaction) => {
        this.currentTransaction = transaction; // Stocker pour la vue consultation
        
        this.transactionForm.patchValue({
          type: transaction.type,
          montant: transaction.montant,
          dateTransaction: new Date(transaction.dateTransaction),
          description: transaction.description,
          categorie: transaction.categorie || '',
          numeroReference: transaction.numeroReference || '',
          societeId: transaction.societeId,
          enlevementId: transaction.enlevementId || null,
          notes: transaction.notes || ''
        });

        // En mode consultation, désactiver tous les champs
        if (this.isViewMode) {
          this.transactionForm.disable();
        } else {
          // En mode édition, le type est toujours désactivé
          this.transactionForm.get('type')?.disable();
        }

        if (transaction.societeId) {
          this.onSocieteChange(transaction.societeId);
        }

        // Charger les échéances existantes
        if (transaction.echeances && transaction.echeances.length > 0) {
          this.transactionForm.patchValue({ hasEcheances: true });
          transaction.echeances.forEach(echeance => {
            const echeanceGroup = this.fb.group({
              montant: [echeance.montant, [Validators.required, Validators.min(0.01)]],
              dateEcheance: [new Date(echeance.dateEcheance), Validators.required]
            });
            if (this.isViewMode) {
              echeanceGroup.disable();
            }
            this.echeancesFormArray.push(echeanceGroup);
          });
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la transaction', err);
        this.snackBar.open('Erreur lors du chargement de la transaction', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.router.navigate([this.basePath + '/transactions']);
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formValue = this.transactionForm.value;

    if (this.isEditMode && this.transactionId) {
      // Mode édition
      const updateRequest: UpdateTransactionRequest = {
        montant: formValue.montant,
        dateTransaction: formValue.dateTransaction.toISOString().split('T')[0],
        description: formValue.description,
        categorie: formValue.categorie || undefined,
        numeroReference: formValue.numeroReference || undefined,
        notes: formValue.notes || undefined
      };

      this.comptabiliteService.updateTransaction(this.transactionId, updateRequest).subscribe({
        next: () => {
          this.snackBar.open('Transaction mise à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate([this.basePath + '/transactions']);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour', err);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Mode création
      const echeances: CreateEcheanceRequest[] = formValue.hasEcheances && formValue.echeances
        ? formValue.echeances.map((e: any) => ({
            montant: e.montant,
            dateEcheance: e.dateEcheance.toISOString().split('T')[0]
          }))
        : undefined;

      // Si le type est désactivé, on doit le récupérer depuis le formulaire
      const type = this.transactionForm.get('type')?.disabled 
        ? this.transactionForm.get('type')?.value 
        : formValue.type;

      const createRequest: CreateTransactionRequest = {
        type: type,
        montant: formValue.montant,
        dateTransaction: formValue.dateTransaction.toISOString().split('T')[0],
        description: formValue.description,
        categorie: formValue.categorie || undefined,
        numeroReference: formValue.numeroReference || undefined,
        societeId: formValue.societeId,
        enlevementId: formValue.enlevementId || undefined,
        notes: formValue.notes || undefined,
        echeances: echeances
      };

      this.comptabiliteService.createTransaction(createRequest).subscribe({
        next: () => {
          this.snackBar.open('Transaction créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate([this.basePath + '/transactions']);
        },
        error: (err) => {
          console.error('Erreur lors de la création', err);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate([this.basePath + '/transactions']);
  }

  // Méthodes helper pour la vue consultation
  getTypeLabel(type: TypeTransaction): string {
    return type === TypeTransaction.RECETTE ? 'Recette' : 'Dépense';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'PARTIELLEMENT_PAYEE': 'Partiellement payée',
      'PAYEE': 'Payée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSocieteName(societeId: number): string {
    const societe = this.societes.find(s => s.id === societeId);
    return societe ? societe.raisonSociale : 'N/A';
  }

  viewEnlevement(enlevementId: number): void {
    if (!enlevementId) {
      console.error('EnlevementId is required');
      return;
    }
    // Déterminer le chemin selon le contexte (admin ou comptable)
    const currentUrl = this.router.url;
    const enlevementPath = currentUrl.startsWith('/comptable') ? '/comptable/enlevements' : '/admin/enlevements';
    console.log('Navigating to enlevement:', enlevementPath, enlevementId);
    this.router.navigate([enlevementPath, enlevementId]).catch(err => {
      console.error('Error navigating to enlevement:', err);
      this.snackBar.open('Erreur lors de la navigation vers l\'enlèvement', 'Fermer', { duration: 3000 });
    });
  }

  editTransaction(): void {
    this.router.navigate([this.basePath + '/transactions', this.transactionId, 'edit']);
  }

  openAddPaiementDialog(): void {
    if (!this.currentTransaction) return;

    const montantRestant = (this.currentTransaction.montant || 0) - (this.currentTransaction.montantPaye || 0);
    
    const dialogRef = this.dialog.open(AddPaiementDialogComponent, {
      width: '500px',
      data: {
        transactionId: this.currentTransaction.id,
        montantRestant: montantRestant
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger la transaction pour afficher le nouveau paiement
        this.loadTransaction();
      }
    });
  }

  TypeTransaction = TypeTransaction;
}

