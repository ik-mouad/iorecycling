import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSkeletonModule } from '@angular/material/skeleton';
import { FormsModule } from '@angular/forms';
import { AuthenticatedLayoutComponent } from '../authenticated-layout/authenticated-layout.component';
import { IconService } from '../../services/icon.service';
import { ChartService } from '../../services/chart.service';

interface KpiData {
  type: 'recyclables' | 'banals' | 'dangereux';
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
  trend?: number;
}

interface RevenueData {
  total: number;
  currency: string;
  sparklineData: number[];
  sparklineLabels: string[];
}

interface CollectionRecord {
  id: number;
  date: string;
  type: 'recyclables' | 'banals' | 'dangereux';
  weight: number;
  status: 'completed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSkeletonModule,
    FormsModule,
    AuthenticatedLayoutComponent
  ],
  template: `
    <app-authenticated-layout>
      <div class="dashboard-container">
        <!-- En-tête Héro -->
        <div class="hero-section">
          <mat-card class="hero-card">
            <div class="hero-content">
              <div class="hero-icon">
                <mat-icon class="truck-icon">local_shipping</mat-icon>
              </div>
              <div class="hero-text">
                <h1 class="hero-title">
                  <span class="counter" [attr.data-count]="collectionCount">{{ animatedCount }}</span>
                  <span class="counter-label">enlèvements effectués</span>
                </h1>
                <p class="hero-subtitle">Depuis le début du partenariat</p>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- KPIs et Revenu -->
        <div class="metrics-section">
          <div class="kpis-grid">
            <!-- KPI Recyclables -->
            <mat-card class="kpi-card recyclables" *ngIf="!isLoading; else kpiSkeleton">
              <div class="kpi-content">
                <div class="kpi-header">
                  <mat-icon class="kpi-icon">autorenew</mat-icon>
                  <div class="kpi-badge recyclables-badge">♻️</div>
                </div>
                <div class="kpi-value">{{ formatWeight(kpiData.recyclables.value) }}</div>
                <div class="kpi-label">Recyclables</div>
                <div class="kpi-trend" *ngIf="kpiData.recyclables.trend">
                  <mat-chip class="trend-chip positive">+{{ kpiData.recyclables.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <!-- KPI Banals -->
            <mat-card class="kpi-card banals" *ngIf="!isLoading; else kpiSkeleton">
              <div class="kpi-content">
                <div class="kpi-header">
                  <mat-icon class="kpi-icon">delete</mat-icon>
                  <div class="kpi-badge banals-badge">🗑️</div>
                </div>
                <div class="kpi-value">{{ formatWeight(kpiData.banals.value) }}</div>
                <div class="kpi-label">Banals</div>
                <div class="kpi-trend" *ngIf="kpiData.banals.trend">
                  <mat-chip class="trend-chip neutral">{{ kpiData.banals.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <!-- KPI Dangereux -->
            <mat-card class="kpi-card dangereux" *ngIf="!isLoading; else kpiSkeleton">
              <div class="kpi-content">
                <div class="kpi-header">
                  <mat-icon class="kpi-icon">warning</mat-icon>
                  <div class="kpi-badge dangereux-badge">☣️</div>
                </div>
                <div class="kpi-value">{{ formatWeight(kpiData.dangereux.value) }}</div>
                <div class="kpi-label">Dangereux</div>
                <div class="kpi-trend" *ngIf="kpiData.dangereux.trend">
                  <mat-chip class="trend-chip negative">-{{ kpiData.dangereux.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <!-- Skeleton pour KPIs -->
            <ng-template #kpiSkeleton>
              <mat-card class="kpi-card" *ngFor="let i of [1,2,3]">
                <div class="kpi-content">
                  <mat-skeleton-loader [attr.aria-label]="'Chargement KPI ' + i" 
                    [ngStyle]="{'width': '100%', 'height': '120px'}">
                  </mat-skeleton-loader>
                </div>
              </mat-card>
            </ng-template>
          </div>

          <!-- Carte Revenu -->
          <mat-card class="revenue-card" *ngIf="!isLoading; else revenueSkeleton">
            <mat-card-header>
              <mat-icon mat-card-avatar>payments</mat-icon>
              <mat-card-title>Produits valorisables</mat-card-title>
              <mat-card-subtitle>Revenus générés</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="revenue-content">
                <div class="revenue-amount">
                  {{ formatCurrency(revenueData.total) }}
                </div>
                <div class="revenue-chart">
                  <canvas #revenueChart width="200" height="60"></canvas>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Skeleton pour Revenu -->
          <ng-template #revenueSkeleton>
            <mat-card class="revenue-card">
              <mat-card-header>
                <mat-skeleton-loader [attr.aria-label]="'Chargement revenus'" 
                  [ngStyle]="{'width': '60px', 'height': '60px', 'border-radius': '50%'}">
                </mat-skeleton-loader>
                <div class="skeleton-text">
                  <mat-skeleton-loader [attr.aria-label]="'Chargement titre revenus'" 
                    [ngStyle]="{'width': '200px', 'height': '20px'}">
                  </mat-skeleton-loader>
                </div>
              </mat-card-header>
              <mat-card-content>
                <mat-skeleton-loader [attr.aria-label]="'Chargement montant revenus'" 
                  [ngStyle]="{'width': '150px', 'height': '40px'}">
                </mat-skeleton-loader>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </div>

        <!-- Filtres -->
        <div class="filters-section">
          <mat-button-toggle-group 
            [(ngModel)]="selectedFilter" 
            (change)="onFilterChange($event)"
            class="filter-group"
            aria-label="Filtrer par type de déchet">
            <mat-button-toggle value="all" aria-label="Tous les types">
              <mat-icon>all_inclusive</mat-icon>
              <span>Tous</span>
            </mat-button-toggle>
            <mat-button-toggle value="recyclables" aria-label="Recyclables uniquement">
              <mat-icon>autorenew</mat-icon>
              <span>Recyclables</span>
            </mat-button-toggle>
            <mat-button-toggle value="banals" aria-label="Banals uniquement">
              <mat-icon>delete</mat-icon>
              <span>Banals</span>
            </mat-button-toggle>
            <mat-button-toggle value="dangereux" aria-label="Dangereux uniquement">
              <mat-icon>warning</mat-icon>
              <span>À détruire</span>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <!-- Table des enlèvements -->
        <div class="table-section">
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>Historique des enlèvements</mat-card-title>
              <mat-card-subtitle>{{ filteredRecords.length }} enregistrement(s)</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="table-container" *ngIf="!isLoading; else tableSkeleton">
                <table mat-table [dataSource]="filteredRecords" class="records-table">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let record">{{ formatDate(record.date) }}</td>
                  </ng-container>

                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let record">
                      <mat-chip [class]="'type-chip ' + record.type">
                        <mat-icon>{{ getTypeIcon(record.type) }}</mat-icon>
                        {{ getTypeLabel(record.type) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="weight">
                    <th mat-header-cell *matHeaderCellDef>Poids</th>
                    <td mat-cell *matCellDef="let record">{{ formatWeight(record.weight) }}</td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Statut</th>
                    <td mat-cell *matCellDef="let record">
                      <mat-chip [class]="'status-chip ' + record.status">
                        {{ getStatusLabel(record.status) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                      class="table-row" 
                      [attr.aria-label]="'Enlèvement du ' + formatDate(row.date) + ', ' + getTypeLabel(row.type) + ', ' + formatWeight(row.weight)">
                  </tr>
                </table>
              </div>

              <!-- Skeleton pour Table -->
              <ng-template #tableSkeleton>
                <div class="table-skeleton">
                  <mat-skeleton-loader *ngFor="let i of [1,2,3,4,5]" 
                    [attr.aria-label]="'Chargement ligne ' + i"
                    [ngStyle]="{'width': '100%', 'height': '48px', 'margin-bottom': '8px'}">
                  </mat-skeleton-loader>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </app-authenticated-layout>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-xl);
    }

    /* En-tête Héro */
    .hero-section {
      margin-bottom: var(--spacing-2xl);
    }

    .hero-card {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
      color: white;
      border-radius: var(--radius-2xl);
      box-shadow: var(--elevation-4);
      overflow: hidden;
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      padding: var(--spacing-2xl);
    }

    .hero-icon {
      flex-shrink: 0;
    }

    .truck-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.9;
    }

    .hero-text {
      flex: 1;
    }

    .hero-title {
      font-family: 'Inter', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 var(--spacing-sm) 0;
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
    }

    .counter {
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .counter-label {
      font-size: 1.5rem;
      font-weight: 500;
      opacity: 0.9;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      opacity: 0.8;
      margin: 0;
    }

    /* Section Métriques */
    .metrics-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
    }

    .kpi-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--elevation-2);
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--elevation-3);
    }

    .kpi-content {
      padding: var(--spacing-xl);
      text-align: center;
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .kpi-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .kpi-badge {
      font-size: 1.25rem;
    }

    .kpi-value {
      font-family: 'Inter', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--spacing-xs);
    }

    .kpi-label {
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--spacing-sm);
    }

    .kpi-trend {
      margin-top: var(--spacing-sm);
    }

    .trend-chip {
      font-size: 0.75rem;
      height: 24px;
    }

    .trend-chip.positive {
      background-color: #dcfce7;
      color: #166534;
    }

    .trend-chip.neutral {
      background-color: #f3f4f6;
      color: #374151;
    }

    .trend-chip.negative {
      background-color: #fef2f2;
      color: #dc2626;
    }

    /* Couleurs spécifiques par type */
    .kpi-card.recyclables {
      border-left: 4px solid var(--color-primary);
    }

    .kpi-card.recyclables .kpi-icon {
      color: var(--color-primary);
    }

    .kpi-card.recyclables .kpi-value {
      color: var(--color-primary);
    }

    .kpi-card.banals {
      border-left: 4px solid #6b7280;
    }

    .kpi-card.banals .kpi-icon {
      color: #6b7280;
    }

    .kpi-card.banals .kpi-value {
      color: #6b7280;
    }

    .kpi-card.dangereux {
      border-left: 4px solid var(--color-warn);
    }

    .kpi-card.dangereux .kpi-icon {
      color: var(--color-warn);
    }

    .kpi-card.dangereux .kpi-value {
      color: var(--color-warn);
    }

    /* Carte Revenu */
    .revenue-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--elevation-2);
      transition: all var(--transition-normal);
    }

    .revenue-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--elevation-3);
    }

    .revenue-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .revenue-amount {
      font-family: 'Inter', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .revenue-chart {
      height: 60px;
    }

    /* Filtres */
    .filters-section {
      margin-bottom: var(--spacing-xl);
    }

    .filter-group {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .filter-group mat-button-toggle {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      border-radius: var(--radius-md);
    }

    /* Table */
    .table-section {
      margin-bottom: var(--spacing-xl);
    }

    .table-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--elevation-2);
    }

    .table-container {
      overflow-x: auto;
    }

    .records-table {
      width: 100%;
    }

    .table-row {
      transition: background-color var(--transition-fast);
    }

    .table-row:hover {
      background-color: var(--color-surface-variant);
    }

    .type-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .type-chip.recyclables {
      background-color: #dcfce7;
      color: #166534;
    }

    .type-chip.banals {
      background-color: #f3f4f6;
      color: #374151;
    }

    .type-chip.dangereux {
      background-color: #fef2f2;
      color: #dc2626;
    }

    .status-chip {
      font-size: 0.75rem;
    }

    .status-chip.completed {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-chip.pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-chip.cancelled {
      background-color: #fef2f2;
      color: #dc2626;
    }

    /* Responsive */
    @media (max-width: 1199px) {
      .metrics-section {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 767px) {
      .dashboard-container {
        padding: var(--spacing-lg);
      }

      .hero-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-lg);
      }

      .hero-title {
        font-size: 2rem;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .counter-label {
        font-size: 1.25rem;
      }

      .kpis-grid {
        grid-template-columns: 1fr;
      }

      .filter-group {
        justify-content: center;
      }

      .filter-group mat-button-toggle {
        flex: 1;
        min-width: 0;
      }

      .filter-group mat-button-toggle span {
        display: none;
      }
    }

    @media (max-width: 479px) {
      .hero-title {
        font-size: 1.75rem;
      }

      .truck-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }

      .kpi-value {
        font-size: 1.5rem;
      }

      .revenue-amount {
        font-size: 2rem;
      }
    }
  `]
})
export class ClientDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;
  
  isLoading = true;
  animatedCount = 0;
  collectionCount = 127;
  selectedFilter = 'all';
  displayedColumns = ['date', 'type', 'weight', 'status'];

  kpiData = {
    recyclables: { value: 45.67, trend: 12 },
    banals: { value: 23.45, trend: -3 },
    dangereux: { value: 8.92, trend: 5 }
  };

  revenueData: RevenueData = {
    total: 125430.75,
    currency: 'MAD',
    sparklineData: [85000, 92000, 88000, 105000, 98000, 125430],
    sparklineLabels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
  };

  allRecords: CollectionRecord[] = [
    { id: 1, date: '2024-01-15', type: 'recyclables', weight: 2.5, status: 'completed' },
    { id: 2, date: '2024-01-14', type: 'banals', weight: 1.8, status: 'completed' },
    { id: 3, date: '2024-01-13', type: 'dangereux', weight: 0.5, status: 'completed' },
    { id: 4, date: '2024-01-12', type: 'recyclables', weight: 3.2, status: 'completed' },
    { id: 5, date: '2024-01-11', type: 'banals', weight: 2.1, status: 'pending' },
    { id: 6, date: '2024-01-10', type: 'recyclables', weight: 1.9, status: 'completed' },
    { id: 7, date: '2024-01-09', type: 'dangereux', weight: 0.3, status: 'completed' },
    { id: 8, date: '2024-01-08', type: 'banals', weight: 2.7, status: 'completed' }
  ];

  filteredRecords: CollectionRecord[] = [];

  constructor(
    private iconService: IconService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.animateCounter();
  }

  ngAfterViewInit(): void {
    // Attendre que la vue soit initialisée pour créer le graphique
    setTimeout(() => {
      this.loadSparklineChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Nettoyer les graphiques
    this.chartService.destroyAllCharts();
  }

  private initializeData(): void {
    // Simuler le chargement des données
    setTimeout(() => {
      this.filteredRecords = [...this.allRecords];
      this.isLoading = false;
    }, 1500);
  }

  private animateCounter(): void {
    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = this.collectionCount;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.animatedCount = Math.floor(startValue + (endValue - startValue) * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private loadSparklineChart(): void {
    if (this.revenueChartRef && this.revenueChartRef.nativeElement) {
      try {
        // Donner un ID unique au canvas
        this.revenueChartRef.nativeElement.id = 'revenue-sparkline';
        
        this.chartService.createSparklineChart(
          this.revenueChartRef.nativeElement,
          this.revenueData.sparklineData,
          this.revenueData.sparklineLabels,
          '#0E9F6E'
        );
        
        console.log('Sparkline chart loaded successfully');
      } catch (error) {
        console.error('Erreur lors du chargement du graphique:', error);
      }
    } else {
      console.warn('Canvas element not found for sparkline chart');
    }
  }

  onFilterChange(event: any): void {
    const filter = event.value;
    
    if (filter === 'all') {
      this.filteredRecords = [...this.allRecords];
    } else {
      this.filteredRecords = this.allRecords.filter(record => record.type === filter);
    }
  }

  formatWeight(weight: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(weight) + ' t';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getTypeIcon(type: string): string {
    return this.iconService.getIcon(type);
  }

  getTypeLabel(type: string): string {
    const labels = {
      recyclables: 'Recyclables',
      banals: 'Banals',
      dangereux: 'Dangereux'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getStatusLabel(status: string): string {
    const labels = {
      completed: 'Terminé',
      pending: 'En cours',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  }
}