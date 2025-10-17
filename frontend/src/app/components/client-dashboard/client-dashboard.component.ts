import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AuthenticatedLayoutComponent } from '../authenticated-layout/authenticated-layout.component';
import { DashboardService, PickupRecord, ValorSummary } from '../../services/dashboard.service';
import { ChartService } from '../../services/chart.service';
import { Chart, ChartConfiguration } from 'chart.js';

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
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
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
                <mat-icon class="truck-icon" 
                          [attr.aria-label]="'Icône camion pour les enlèvements'">local_shipping</mat-icon>
              </div>
              <div class="hero-text">
                <h1 class="hero-title">
                  <span class="counter" 
                        data-testid="kpi-pickups"
                        [attr.data-count]="collectionCount"
                        [attr.aria-label]="'Nombre total d\'enlèvements: ' + animatedCount">{{ animatedCount }}</span>
                  <span class="counter-label">enlèvements effectués</span>
                </h1>
                <p class="hero-subtitle">Depuis le début du partenariat</p>
                <div class="last-updated" *ngIf="lastUpdated">
                  <mat-icon class="update-icon">schedule</mat-icon>
                  <span class="update-text">Dernière mise à jour: {{ formatLastUpdated(lastUpdated) }}</span>
                </div>
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
                  <mat-icon class="kpi-icon" 
                            [matTooltip]="'Déchets recyclables collectés'"
                            [attr.aria-label]="'Icône recyclables'">autorenew</mat-icon>
                  <div class="kpi-badge recyclables-badge" 
                       [attr.aria-label]="'Badge recyclables'">♻️</div>
                </div>
                <div class="kpi-value" 
                     data-testid="kpi-valorisables"
                     [attr.aria-label]="'Quantité recyclables: ' + formatWeight(kpiData.recyclables.value)">{{ formatWeight(kpiData.recyclables.value) }}</div>
                <div class="kpi-label">Recyclables</div>
                <div class="kpi-trend" *ngIf="kpiData.recyclables.trend">
                  <mat-chip class="trend-chip positive" 
                            [matTooltip]="'Évolution positive de ' + kpiData.recyclables.trend + '%'"
                            [attr.aria-label]="'Tendance positive: +' + kpiData.recyclables.trend + '%'">+{{ kpiData.recyclables.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <!-- KPI Banals -->
            <mat-card class="kpi-card banals" *ngIf="!isLoading; else kpiSkeleton">
              <div class="kpi-content">
                <div class="kpi-header">
                  <mat-icon class="kpi-icon" 
                            [matTooltip]="'Déchets banals collectés'"
                            [attr.aria-label]="'Icône banals'">delete</mat-icon>
                  <div class="kpi-badge banals-badge" 
                       [attr.aria-label]="'Badge banals'">🗑️</div>
                </div>
                <div class="kpi-value" data-testid="kpi-banals">{{ formatWeight(kpiData.banals.value) }}</div>
                <div class="kpi-label">Banals</div>
                <div class="kpi-trend" *ngIf="kpiData.banals.trend">
                  <mat-chip class="trend-chip negative" 
                            [matTooltip]="'Évolution négative de ' + kpiData.banals.trend + '%'"
                            [attr.aria-label]="'Tendance négative: ' + kpiData.banals.trend + '%'">{{ kpiData.banals.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <!-- KPI Dangereux -->
            <mat-card class="kpi-card dangereux" *ngIf="!isLoading; else kpiSkeleton">
              <div class="kpi-content">
                <div class="kpi-header">
                  <mat-icon class="kpi-icon" 
                            [matTooltip]="'Déchets dangereux collectés'"
                            [attr.aria-label]="'Icône dangereux'">warning</mat-icon>
                  <div class="kpi-badge dangereux-badge" 
                       [attr.aria-label]="'Badge dangereux'">☢️</div>
                </div>
                <div class="kpi-value" data-testid="kpi-dangereux">{{ formatWeight(kpiData.dangereux.value) }}</div>
                <div class="kpi-label">Dangereux</div>
                <div class="kpi-trend" *ngIf="kpiData.dangereux.trend">
                  <mat-chip class="trend-chip positive" 
                            [matTooltip]="'Évolution positive de ' + kpiData.dangereux.trend + '%'"
                            [attr.aria-label]="'Tendance positive: +' + kpiData.dangereux.trend + '%'">+{{ kpiData.dangereux.trend }}%</mat-chip>
                </div>
              </div>
            </mat-card>

            <ng-template #kpiSkeleton>
              <mat-card class="kpi-card" *ngFor="let i of [1,2,3]">
                <div class="kpi-content">
                  <div class="kpi-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-avatar"></div>
                  </div>
                  <div class="skeleton-text"></div>
                  <div class="skeleton-text short"></div>
                  <div class="skeleton-text short"></div>
                </div>
              </mat-card>
            </ng-template>
          </div>

          <!-- Revenue Card -->
          <mat-card class="revenue-card" *ngIf="!isLoading; else revenueSkeleton">
            <mat-card-header>
              <mat-card-title>Produits valorisables</mat-card-title>
              <mat-card-subtitle>Revenus générés</mat-card-subtitle>
            </mat-card-header>
          <mat-card-content>
              <div class="revenue-content">
                <div class="revenue-amount" data-testid="kpi-revenue">
                  {{ formatCurrency(revenueData.total) }}
                </div>
                <div class="revenue-chart">
                  <canvas #revenueChart width="200" height="60"></canvas>
                </div>
              </div>
          </mat-card-content>
          </mat-card>

          <ng-template #revenueSkeleton>
            <mat-card class="revenue-card">
              <div class="revenue-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text"></div>
              </div>
            </mat-card>
          </ng-template>
        </div>

        <!-- Filtres et Recherche -->
        <div class="filters-section">
          <div class="filters-row">
            <mat-button-toggle-group 
              [(ngModel)]="selectedFilter" 
              (change)="onFilterChange($event)"
              class="filter-group"
              aria-label="Filtrer par type de déchet">
                     <mat-button-toggle value="all" aria-label="Tous les types" data-testid="filter-all">
                       <mat-icon>all_inclusive</mat-icon>
                       <span>Tous</span>
                     </mat-button-toggle>
                     <mat-button-toggle value="recyclables" aria-label="Recyclables uniquement" data-testid="filter-recyclables">
                       <mat-icon>autorenew</mat-icon>
                       <span>Recyclables</span>
                     </mat-button-toggle>
                     <mat-button-toggle value="banals" aria-label="Banals uniquement" data-testid="filter-banals">
                       <mat-icon>delete</mat-icon>
                       <span>Banals</span>
                     </mat-button-toggle>
                     <mat-button-toggle value="dangereux" aria-label="Dangereux uniquement" data-testid="filter-dangereux">
                       <mat-icon>warning</mat-icon>
                       <span>À détruire</span>
                     </mat-button-toggle>
            </mat-button-toggle-group>
            
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Rechercher...</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="applyFilter()"
                     placeholder="Date, site, type..."
                     aria-label="Champ de recherche pour les enlèvements">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Table des enlèvements -->
        <div class="table-section">
          <div class="table-header">
            <h2 class="table-title">Historique des enlèvements</h2>
            <div class="table-actions">
              <button mat-raised-button 
                      color="primary" 
                      (click)="exportToCSV()"
                      [matTooltip]="'Exporter les données en format CSV'"
                      [attr.aria-label]="'Exporter les données en CSV'">
                <mat-icon>download</mat-icon>
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>
          
          <div class="table-container" *ngIf="!isLoading; else tableSkeleton">
            <!-- État d'erreur -->
            <div *ngIf="hasError" class="error-banner">
              <mat-icon [attr.aria-label]="'Icône d\'erreur'">error_outline</mat-icon>
              <span>Erreur lors du chargement des données</span>
              <button mat-button color="primary" (click)="loadPickups()" [attr.aria-label]="'Réessayer de charger les enlèvements'">Réessayer</button>
            </div>

            <!-- État vide -->
            <div *ngIf="!hasError && dataSource.data.length === 0" class="empty-state">
              <mat-icon class="empty-state-icon" 
                        [attr.aria-label]="'Icône boîte vide'">inbox</mat-icon>
              <h3>🎉 Aucun enlèvement trouvé</h3>
              <p>Parfait ! Aucun enlèvement ne correspond à vos critères de recherche. Essayez de modifier vos filtres pour voir plus de données.</p>
              <button mat-raised-button 
                      color="primary" 
                      (click)="clearFilters()"
                      [matTooltip]="'Réinitialiser tous les filtres'"
                      [attr.aria-label]="'Réinitialiser les filtres pour voir tous les enlèvements'">
                <mat-icon>clear_all</mat-icon>
                <span>Voir tous les enlèvements</span>
              </button>
            </div>

            <!-- Tableau -->
            <div *ngIf="!hasError && dataSource.data.length > 0" class="table-wrapper">
              <table mat-table [dataSource]="dataSource" matSort class="records-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Date & Heure</th>
                  <td mat-cell *matCellDef="let record">
                    <div class="date-time-cell">
                      <div class="date">{{ formatDate(record.date) }}</div>
                      <div class="time">{{ record.heure }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let record">
                    <mat-chip [style.background-color]="getWasteTypeColor(record.type)" 
                              [style.color]="'white'"
                              class="type-chip"
                              [attr.aria-label]="'Type d\'enlèvement: ' + getTypeLabel(record.type)">
                      <mat-icon>{{ getTypeIcon(record.type) }}</mat-icon>
                      {{ getTypeLabel(record.type) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="tonnage">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Tonnage</th>
                  <td mat-cell *matCellDef="let record">
                    <span class="tonnage-value" [attr.aria-label]="'Tonnage: ' + formatWeight(record.tonnage)">{{ formatWeight(record.tonnage) }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="site">
                  <th mat-header-cell *matHeaderCellDef>Site</th>
                  <td mat-cell *matCellDef="let record">
                    <span class="site-name" [attr.aria-label]="'Site: ' + record.site">{{ record.site }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="documents">
                  <th mat-header-cell *matHeaderCellDef>Documents</th>
                  <td mat-cell *matCellDef="let record">
                    <div class="documents-cell">
                      <button *ngFor="let doc of record.docs" 
                              mat-icon-button 
                              [matTooltip]="getDocumentLabel(doc.type)"
                              (click)="downloadDocument(doc.url, doc.name)"
                              class="doc-button"
                              [attr.aria-label]="'Télécharger le document ' + getDocumentLabel(doc.type) + ' : ' + doc.name">
                        <mat-icon>{{ getDocumentIcon(doc.type) }}</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                    class="table-row" 
                    [attr.aria-label]="'Enlèvement du ' + formatDate(row.date) + ' à ' + row.heure + ', ' + getTypeLabel(row.type) + ', ' + formatWeight(row.tonnage)">
                </tr>
              </table>

              <mat-paginator [pageSizeOptions]="[10, 25, 50]" 
                             showFirstLastButtons
                             aria-label="Sélectionner la page des enlèvements">
              </mat-paginator>
            </div>
          </div>

          <!-- Skeleton pour Table -->
          <ng-template #tableSkeleton>
            <div class="table-skeleton">
              <div *ngFor="let i of [1,2,3,4,5]" 
                   class="loading-skeleton"
                   [attr.aria-label]="'Chargement ligne ' + i">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
              </div>
            </div>
          </ng-template>
        </div>

        <!-- Sous-liste Valorisation (si filtre = Recyclables) -->
        <div class="valuables-section" *ngIf="selectedFilter === 'recyclables' && !isLoading">
          <mat-card class="valuables-card">
            <mat-card-header>
              <mat-icon mat-card-avatar [attr.aria-label]="'Icône écologique'">eco</mat-icon>
              <mat-card-title>Détails valorisables (mois en cours)</mat-card-title>
              <mat-card-subtitle>Matériaux recyclables collectés</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="!valuablesLoading; else valuablesSkeleton">
                <div class="valuables-table-container">
                  <table mat-table [dataSource]="valuablesDataSource" class="valuables-table">
                    <ng-container matColumnDef="material">
                      <th mat-header-cell *matHeaderCellDef>Matériau</th>
                      <td mat-cell *matCellDef="let item">{{ item.material }}</td>
                    </ng-container>

                    <ng-container matColumnDef="quantity">
                      <th mat-header-cell *matHeaderCellDef>Quantité</th>
                      <td mat-cell *matCellDef="let item">{{ formatWeight(item.quantity) }}</td>
                    </ng-container>

                    <ng-container matColumnDef="pricePerKg">
                      <th mat-header-cell *matHeaderCellDef>Prix/kg</th>
                      <td mat-cell *matCellDef="let item">{{ formatCurrency(item.pricePerKg) }}</td>
                    </ng-container>

                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let item">
                        <span class="total-amount">{{ formatCurrency(item.total) }}</span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="valuablesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: valuablesColumns;"></tr>
                  </table>
                </div>

                <div class="valuables-summary">
                  <div class="total-section">
                    <span class="total-label">Total général :</span>
                    <span class="total-value">{{ formatCurrency(valuablesReport?.totalAmount || 0) }}</span>
                  </div>
                         <button mat-raised-button color="primary" (click)="downloadReport()" data-testid="btn-download-pdf">
                           <mat-icon>download</mat-icon>
                           <span>Télécharger rapport PDF</span>
                         </button>
                </div>
              </div>

              <!-- Skeleton pour Valorisation -->
              <ng-template #valuablesSkeleton>
                <div class="valuables-skeleton">
                  <div *ngFor="let i of [1,2,3,4,5]" 
                       class="loading-skeleton"
                       [attr.aria-label]="'Chargement valorisation ' + i">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                  </div>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </app-authenticated-layout>
  `,
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('revenueChart') revenueChartRef!: any;

  // Données
  pickups: PickupRecord[] = [];
  valuablesReport: ValorSummary | null = null;
  dataSource = new MatTableDataSource<PickupRecord>([]);
  valuablesDataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['date', 'type', 'tonnage', 'site', 'documents'];
  valuablesColumns: string[] = ['material', 'quantity', 'pricePerKg', 'total'];

  // États
  isLoading = false;
  hasError = false;
  valuablesLoading = false;
  selectedFilter = 'all';
  searchTerm = '';
  lastUpdated: Date | null = null;

  // Données KPI
  collectionCount = 0;
  animatedCount = 0;
  kpiData = {
    recyclables: { value: 0, trend: 5 },
    banals: { value: 0, trend: -2 },
    dangereux: { value: 0, trend: 8 }
  };

  // Données de revenu
  revenueData = {
    total: 0,
    sparklineData: [1200, 1900, 3000, 5000, 2000, 3000],
    sparklineLabels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
  };

  constructor(
    private dashboardService: DashboardService,
    private chartService: ChartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.animateCounter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.setupFilterPredicate();
    this.createRevenueChart();
  }

  private loadData(): void {
    this.loadPickups();
    this.loadValuablesReport();
  }

  loadPickups(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dashboardService.getPickups(0, 50, this.selectedFilter === 'all' ? 'ALL' : this.selectedFilter.toUpperCase()).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.isLoading = false;
        this.lastUpdated = new Date();
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enlèvements:', error);
        this.hasError = true;
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
          duration: 3000
        });
      }
    });
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

    animate();
  }

  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: PickupRecord, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.date.toLowerCase().includes(searchStr) ||
        data.type.toLowerCase().includes(searchStr) ||
        data.site.toLowerCase().includes(searchStr) ||
        data.heure.toLowerCase().includes(searchStr)
      );
    };
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.value;
    this.loadPickups();
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.loadPickups();
  }

  loadValuablesReport(): void {
    this.valuablesLoading = true;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // Format YYYY-MM
    
    this.dashboardService.getValuablesReport(currentMonth).subscribe({
      next: (report) => {
        this.valuablesReport = report;
        this.valuablesDataSource.data = report.details;
        this.valuablesLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport valorisables:', error);
        this.valuablesLoading = false;
        this.snackBar.open('Erreur lors du chargement du rapport valorisables', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  downloadDocument(url: string, filename: string): void {
    this.dashboardService.downloadDocument(url, filename);
    this.snackBar.open(`Téléchargement de ${filename}`, 'Fermer', {
      duration: 2000
    });
  }

  downloadReport(): void {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format YYYY-MM
    this.dashboardService.downloadReport(currentMonth);
    this.snackBar.open('Téléchargement du rapport PDF', 'Fermer', {
      duration: 2000
    });
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
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    return date.toLocaleString('fr-FR');
  }

  getWasteTypeColor(type: string): string {
    return this.dashboardService.getWasteTypeColor(type);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'recyclables': 'Recyclables',
      'banals': 'Banals',
      'dangereux': 'Dangereux'
    };
    return labels[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'recyclables': 'autorenew',
      'banals': 'delete',
      'dangereux': 'warning'
    };
    return icons[type] || 'help';
  }

  getDocumentIcon(type: string): string {
    return this.dashboardService.getDocumentIcon(type);
  }

  getDocumentLabel(type: string): string {
    return this.dashboardService.getDocumentLabel(type);
  }

  exportToCSV(): void {
    // TODO: Implémenter l'export CSV
    this.snackBar.open('Export CSV en cours de développement', 'Fermer', {
      duration: 2000
    });
  }

  private createRevenueChart(): void {
    if (this.revenueChartRef && this.revenueChartRef.nativeElement) {
      // Configuration du canvas
      this.revenueChartRef.nativeElement.id = 'revenue-sparkline';
      
      this.chartService.createSparklineChart(
        this.revenueChartRef.nativeElement,
        this.revenueData.sparklineData,
        this.revenueData.sparklineLabels,
        '#0E9F6E'
      );
    }
  }
}