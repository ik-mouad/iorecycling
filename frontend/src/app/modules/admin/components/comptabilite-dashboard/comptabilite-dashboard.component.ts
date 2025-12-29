import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { ComptabiliteDashboard, Transaction, Echeance } from '../../../../models/comptabilite.model';
import { SocieteService } from '../../../../services/societe.service';
import { Societe } from '../../../../models/societe.model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comptabilite-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './comptabilite-dashboard.component.html',
  styleUrls: ['./comptabilite-dashboard.component.scss']
})
export class ComptabiliteDashboardComponent implements OnInit {
  dashboard: ComptabiliteDashboard | null = null;
  loading = false;
  error: string | null = null;
  
  // Base path pour les routes (admin ou comptable)
  basePath: string = '/admin/comptabilite';
  
  // Filtres
  societeId: number | null = null; // null = toutes les sociétés
  societes: Societe[] = [];
  dateDebut: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  dateFin: string = new Date().toISOString().split('T')[0];
  periode: 'mensuel' | 'trimestriel' | 'annuel' = 'mensuel';
  
  // Alertes
  transactionsImpayees: Transaction[] = [];
  echeancesEnRetard: Echeance[] = [];
  loadingTransactions = false;
  loadingEcheances = false;

  constructor(
    private comptabiliteService: ComptabiliteService,
    private societeService: SocieteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable';
    } else {
      this.basePath = '/admin/comptabilite';
    }
    
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
        // Par défaut, aucune société n'est sélectionnée (affiche toutes les sociétés)
        if (this.societeId === null || this.societeId === undefined) {
          this.loadDashboard();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sociétés', err);
        this.error = 'Erreur lors du chargement des sociétés';
      }
    });
  }

  loadDashboard(): void {
    // Permettre null pour "toutes les sociétés"
    this.loading = true;
    this.error = null;

    this.comptabiliteService.getDashboard(this.societeId, this.dateDebut, this.dateFin, this.periode)
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.loading = false;
          
          // Charger les détails des alertes si nécessaire (seulement si une société est sélectionnée)
          if (this.societeId !== null && this.societeId !== undefined) {
            if (data.nombreTransactionsImpayees > 0) {
              this.loadTransactionsImpayees();
            }
            if (data.nombreEcheancesEnRetard > 0) {
              this.loadEcheancesEnRetard();
            }
          } else {
            // Si toutes les sociétés, vider les listes d'alertes
            this.transactionsImpayees = [];
            this.echeancesEnRetard = [];
          }
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du dashboard';
          this.loading = false;
          console.error(err);
        }
      });
  }

  loadTransactionsImpayees(): void {
    if (this.societeId === null || this.societeId === undefined) return;
    
    this.loadingTransactions = true;
    this.comptabiliteService.getTransactionsImpayees(this.societeId).subscribe({
      next: (transactions) => {
        this.transactionsImpayees = transactions;
        this.loadingTransactions = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des transactions impayées', err);
        this.loadingTransactions = false;
      }
    });
  }

  loadEcheancesEnRetard(): void {
    if (this.societeId === null || this.societeId === undefined) return;
    
    this.loadingEcheances = true;
    this.comptabiliteService.getEcheancesEnRetard(this.societeId).subscribe({
      next: (echeances) => {
        this.echeancesEnRetard = echeances;
        this.loadingEcheances = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des échéances en retard', err);
        this.loadingEcheances = false;
      }
    });
  }

  viewTransaction(transactionId: number): void {
    this.router.navigate(['/admin/comptabilite/transactions', transactionId]);
  }

  onPeriodeChange(periode: 'mensuel' | 'trimestriel' | 'annuel'): void {
    this.periode = periode;
    this.loadDashboard();
  }
}

