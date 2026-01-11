import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';
import { DashboardKpis } from '../../../../models/dashboard.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { I18nService } from '../../../../services/i18n.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

/**
 * Composant : Dashboard Client avec les 5 KPIs
 * - KPI 1 : Date du prochain enlèvement
 * - KPI 2 : Quantités par type de déchet
 * - KPI 3 : Nombre total d'enlèvements
 * - KPI 4 : Budget recyclage
 * - KPI 5 : Budget traitement (A DETRUIRE)
 */
@Component({
  selector: 'app-client-dashboard-kpis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './client-dashboard-kpis.component.html',
  styleUrls: ['./client-dashboard-kpis.component.scss']
})
export class ClientDashboardKpisComponent implements OnInit {
  kpis?: DashboardKpis;
  loading = false;
  filterForm!: FormGroup;
  pieChart?: Chart;

  periodesPredefinies: { value: string; label: string }[] = [];

  constructor(
    private dashboardService: DashboardService,
    private fb: FormBuilder,
    private i18n: I18nService
  ) {
    this.updatePeriodesLabels();
  }

  updatePeriodesLabels(): void {
    this.periodesPredefinies = [
      { value: 'mois-en-cours', label: this.i18n.t('clientDashboard.periodes.moisEnCours') },
      { value: 'mois-precedent', label: this.i18n.t('clientDashboard.periodes.moisPrecedent') },
      { value: '3-mois', label: this.i18n.t('clientDashboard.periodes.3Mois') },
      { value: '6-mois', label: this.i18n.t('clientDashboard.periodes.6Mois') },
      { value: 'annee-en-cours', label: this.i18n.t('clientDashboard.periodes.anneeEnCours') },
      { value: 'depuis-debut', label: this.i18n.t('clientDashboard.periodes.depuisDebut') },
      { value: 'personnalise', label: this.i18n.t('clientDashboard.periodes.personnalise') }
    ];
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.loadKpis();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      periode: ['mois-en-cours'],
      dateDebut: [null],
      dateFin: [null]
    });

    // Observer les changements de période
    this.filterForm.get('periode')?.valueChanges.subscribe(periode => {
      if (periode !== 'personnalise') {
        this.loadKpis();
      }
    });
  }

  loadKpis(): void {
    this.loading = true;
    const periode = this.filterForm.value.periode;

    let dateDebut: string | undefined;
    let dateFin: string | undefined;

    if (periode === 'personnalise') {
      dateDebut = this.filterForm.value.dateDebut?.toISOString().split('T')[0];
      dateFin = this.filterForm.value.dateFin?.toISOString().split('T')[0];
    } else {
      const dates = this.dashboardService.getPeriodeDates(periode);
      dateDebut = dates.dateDebut || undefined;
      dateFin = dates.dateFin || undefined;
    }

    this.dashboardService.getKpis(dateDebut, dateFin).subscribe({
      next: (kpis) => {
        this.kpis = kpis;
        this.loading = false;
        setTimeout(() => this.createPieChart(), 100);
      },
      error: (error) => {
        console.error('Erreur chargement KPIs:', error);
        this.loading = false;
      }
    });
  }

  createPieChart(): void {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas || !this.kpis) return;

    // Détruire le graphique existant
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: [
          this.i18n.t('enlevement.typeRecyclable'),
          this.i18n.t('enlevement.typeBanal'),
          this.i18n.t('enlevement.typeADetruire')
        ],
        datasets: [{
          data: [
            this.kpis.quantites.recyclable,
            this.kpis.quantites.banal,
            this.kpis.quantites.aDetruire
          ],
          backgroundColor: [
            '#4caf50', // Vert pour recyclable
            '#9e9e9e', // Gris pour banal
            '#f44336'  // Rouge pour A détruire
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const datasetValues = (context.dataset.data as Array<number | null | undefined>) || [];
                const total = datasetValues.reduce(
                  (sum: number, current) => sum + (typeof current === 'number' ? current : 0),
                  0
                );
                const value = typeof context.parsed === 'number' ? context.parsed : 0;
                if (!total) {
                  return `${label}: ${value.toFixed(3)} kg`;
                }
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value.toFixed(3)} kg (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.pieChart = new Chart(ctx, config);
  }

  applyCustomPeriod(): void {
    if (this.filterForm.value.dateDebut && this.filterForm.value.dateFin) {
      this.loadKpis();
    }
  }

  isPersonnalise(): boolean {
    return this.filterForm.value.periode === 'personnalise';
  }

  getTauxClass(taux: number): string {
    if (taux >= 85) return 'success';
    if (taux >= 70) return 'primary';
    if (taux >= 50) return 'warning';
    return 'danger';
  }

  getTauxLabel(taux: number): string {
    if (taux >= 85) return this.i18n.t('clientDashboard.tauxLabels.excellent');
    if (taux >= 70) return this.i18n.t('clientDashboard.tauxLabels.tresBon');
    if (taux >= 50) return this.i18n.t('clientDashboard.tauxLabels.bon');
    if (taux >= 30) return this.i18n.t('clientDashboard.tauxLabels.correct');
    return this.i18n.t('clientDashboard.tauxLabels.insuffisant');
  }

  // Exposer Math pour le template
  Math = Math;

  // Exposer Object.keys pour le template
  Object = Object;

  getFormattedMoyenne(): string {
    return (this.kpis?.moyenneParSemaine || 0).toFixed(1);
  }
}
