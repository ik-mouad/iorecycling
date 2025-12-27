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
import { Router } from '@angular/router';

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
  
  // Filtres
  societeId: number | null = null;
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
        if (this.societes.length > 0 && !this.societeId) {
          this.societeId = this.societes[0].id;
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
    if (!this.societeId) {
      this.error = 'Veuillez sélectionner une société';
      return;
    }

    this.loading = true;
    this.error = null;

    this.comptabiliteService.getDashboard(this.societeId, this.dateDebut, this.dateFin, this.periode)
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.loading = false;
          
          // Charger les détails des alertes si nécessaire
          if (data.nombreTransactionsImpayees > 0) {
            this.loadTransactionsImpayees();
          }
          if (data.nombreEcheancesEnRetard > 0) {
            this.loadEcheancesEnRetard();
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
    if (!this.societeId) return;
    
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
    if (!this.societeId) return;
    
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

