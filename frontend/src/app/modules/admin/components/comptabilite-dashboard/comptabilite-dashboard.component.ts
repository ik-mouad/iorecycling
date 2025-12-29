import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
import { RouterModule, Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ComptabiliteService } from '../../../../services/comptabilite.service';
import { ComptabiliteDashboard, Transaction, TypeTransaction, TypeRecette } from '../../../../models/comptabilite.model';
import { SocieteService } from '../../../../services/societe.service';
import { Societe } from '../../../../models/societe.model';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

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
export class ComptabiliteDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('financialChart', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
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
  
  // Transactions récentes
  recentTransactions: Transaction[] = [];
  loadingRecentTransactions = false;
  
  // Chart instance
  private chartInstance: Chart | null = null;

  constructor(
    private comptabiliteService: ComptabiliteService,
    private societeService: SocieteService,
    private router: Router
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

  ngAfterViewInit(): void {
    // Le graphique sera créé après le chargement des données
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
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
    this.loading = true;
    this.error = null;

    this.comptabiliteService.getDashboard(this.societeId, this.dateDebut, this.dateFin, this.periode)
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.loading = false;
          
          // Charger les transactions récentes
          this.loadRecentTransactions();
          
          // Créer/mettre à jour le graphique
          setTimeout(() => {
            this.createChart();
          }, 100);
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du dashboard';
          this.loading = false;
          console.error(err);
        }
      });
  }

  loadRecentTransactions(): void {
    this.loadingRecentTransactions = true;
    
    // Charger les 4 dernières transactions
    this.comptabiliteService.getTransactions(
      this.societeId,
      undefined,
      undefined,
      0,
      4
    ).subscribe({
      next: (page) => {
        this.recentTransactions = page.content;
        this.loadingRecentTransactions = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des transactions récentes', err);
        this.loadingRecentTransactions = false;
      }
    });
  }

  createChart(): void {
    if (!this.dashboard || !this.chartCanvas) {
      return;
    }

    // Détruire le graphique existant
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const evolutionMensuelle = this.dashboard.evolutionMensuelle || [];
    
    // Préparer les données pour le graphique
    const labels = evolutionMensuelle.map(e => {
      // Extraire le mois du libellé (ex: "Janvier 2024" -> "Jan")
      const parts = e.moisLibelle.split(' ');
      return parts[0].substring(0, 3);
    });
    
    const recettesData = evolutionMensuelle.map(e => e.recettes);
    const depensesData = evolutionMensuelle.map(e => e.depenses);

    // Si pas de données, créer des données par défaut
    if (labels.length === 0) {
      labels.push('Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin');
      recettesData.push(0, 0, 0, 0, 0, 0);
      depensesData.push(0, 0, 0, 0, 0, 0);
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Recettes',
            data: recettesData,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: false,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            label: 'Dépenses',
            data: depensesData,
            borderColor: '#fd7e14',
            backgroundColor: 'rgba(253, 126, 20, 0.1)',
            tension: 0.4,
            fill: false,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#fd7e14',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // On utilise notre propre légende
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' MAD';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280',
              callback: function(value) {
                return value.toFixed(2);
              }
            }
          }
        }
      }
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, config);
    }
  }

  onSocieteChange(): void {
    this.loadDashboard();
  }

  onPeriodeChange(periode: 'mensuel' | 'trimestriel' | 'annuel'): void {
    this.periode = periode;
    this.loadDashboard();
  }

  getTransactionSubtitle(transaction: Transaction): string {
    if (transaction.type === TypeTransaction.RECETTE) {
      if (transaction.typeRecette === TypeRecette.PRESTATION) {
        return 'Prestation';
      } else if (transaction.typeRecette === TypeRecette.VENTE_MATIERE) {
        return 'Vente matière';
      }
      return 'Recette';
    } else {
      return 'Dépense';
    }
  }

  viewTransaction(transactionId: number): void {
    this.router.navigate([this.basePath + '/transactions', transactionId]);
  }
}
