import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { SocieteService } from '../../../../services/societe.service';
import { Transaction, TypeTransaction, StatutTransaction } from '../../../../models/comptabilite.model';
import { Societe } from '../../../../models/societe.model';
import { Page } from '../../../../models/societe.model';

/**
 * Composant : Liste des transactions (recettes/dépenses)
 */
@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit {
  transactions: Transaction[] = [];
  societes: Societe[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  filterForm: FormGroup;
  selectedType: TypeTransaction | null = null;
  selectedSocieteId: number | null = null;

  displayedColumns: string[] = ['date', 'type', 'description', 'enlevement', 'societe', 'montant', 'montantPaye', 'statut', 'actions'];
  
  // Exposer l'enum au template
  TypeTransaction = TypeTransaction;
  
  // Base path pour les routes (admin ou comptable)
  private basePath: string = '/admin/comptabilite';

  constructor(
    private fb: FormBuilder,
    private comptabiliteService: ComptabiliteService,
    private societeService: SocieteService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      societeId: [null],
      type: [null],
      dateDebut: [null],
      dateFin: [null]
    });
  }

  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    this.updateBasePath();
    
    this.loadSocietes();
    this.loadTransactions();
  }
  
  private updateBasePath(): void {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable';
    } else {
      this.basePath = '/admin/comptabilite';
    }
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

  loadTransactions(): void {
    const societeId = this.filterForm.get('societeId')?.value;
    const type = this.filterForm.get('type')?.value;
    const enlevementId = this.filterForm.get('enlevementId')?.value;
    
    // Si aucune société n'est sélectionnée, charger toutes les transactions
    this.loading = true;
    this.comptabiliteService.getTransactions(societeId || null, type, enlevementId || null, this.pageIndex, this.pageSize)
      .subscribe({
        next: (page) => {
          this.transactions = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des transactions', err);
          this.snackBar.open('Erreur lors du chargement des transactions', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadTransactions();
  }

  createTransaction(type: TypeTransaction): void {
    const societeId = this.filterForm.get('societeId')?.value;
    // La société n'est plus obligatoire, on peut créer une transaction sans société sélectionnée
    const queryParams: any = { type };
    if (societeId) {
      queryParams.societeId = societeId;
    }
    this.router.navigate([this.basePath + '/transactions/new'], { 
      queryParams 
    });
  }

  editTransaction(id: number): void {
    this.updateBasePath(); // Mettre à jour le basePath avant la navigation
    this.router.navigate([this.basePath + '/transactions', id, 'edit']);
  }

  viewTransaction(id: number): void {
    this.updateBasePath(); // Mettre à jour le basePath avant la navigation
    this.router.navigate([this.basePath + '/transactions', id]);
  }

  viewEnlevement(enlevementId: number): void {
    // Déterminer le chemin selon le contexte (admin ou comptable)
    const enlevementPath = this.router.url.startsWith('/comptable') ? '/comptable/enlevements' : '/admin/enlevements';
    this.router.navigate([enlevementPath, enlevementId]);
  }

  deleteTransaction(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      this.comptabiliteService.deleteTransaction(id).subscribe({
        next: () => {
          this.snackBar.open('Transaction supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadTransactions();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getTypeLabel(type: TypeTransaction): string {
    return type === TypeTransaction.RECETTE ? 'Recette' : 'Dépense';
  }

  getTypeColor(type: TypeTransaction): string {
    return type === TypeTransaction.RECETTE ? 'primary' : 'warn';
  }

  getStatutLabel(statut: StatutTransaction): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'PARTIELLEMENT_PAYEE': 'Partiellement payée',
      'PAYEE': 'Payée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: StatutTransaction): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE': 'warn',
      'PARTIELLEMENT_PAYEE': 'accent',
      'PAYEE': 'primary',
      'ANNULEE': ''
    };
    return colors[statut] || '';
  }
}

