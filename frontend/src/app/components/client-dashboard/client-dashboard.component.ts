import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSkeletonModule } from '@angular/material/skeleton';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AuthenticatedLayoutComponent } from '../authenticated-layout/authenticated-layout.component';
import { IconService } from '../../services/icon.service';
import { ChartService } from '../../services/chart.service';
import { DashboardService, PickupRecord, ValuablesReport } from '../../services/dashboard.service';

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

// Interface supprimée car remplacée par PickupRecord du service

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

        <!-- Filtres et Recherche -->
        <div class="filters-section">
          <div class="filters-row">
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
            
            <mat-form-field class="search-field" appearance="outline">
              <mat-label>Rechercher...</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (input)="applyFilter()"
                     placeholder="Date, site, type...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>

        <!-- Table des enlèvements -->
        <div class="table-section">
          <mat-card class="table-card">
            <mat-card-header>
              <mat-card-title>Historique des enlèvements</mat-card-title>
              <mat-card-subtitle>{{ dataSource.data.length }} enregistrement(s)</mat-card-subtitle>
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
            </mat-card-header>
          <mat-card-content>
              <!-- État de chargement -->
              <div class="table-container" *ngIf="!isLoading; else tableSkeleton">
                <!-- État d'erreur -->
                <div *ngIf="hasError" class="error-banner">
                  <mat-icon>error_outline</mat-icon>
                  <span>Erreur lors du chargement des données</span>
                  <button mat-button color="primary" (click)="loadPickups()">Réessayer</button>
                </div>

                <!-- État vide -->
                <div *ngIf="!hasError && dataSource.data.length === 0" class="empty-state">
                  <mat-icon class="empty-icon" 
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
                    <ng-container matColumnDef="dateHeure">
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
                                  class="type-chip">
                          <mat-icon>{{ getTypeIcon(record.type) }}</mat-icon>
                          {{ getTypeLabel(record.type) }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="tonnage">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Tonnage</th>
                      <td mat-cell *matCellDef="let record">
                        <span class="tonnage-value">{{ formatWeight(record.tonnage) }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="site">
                      <th mat-header-cell *matHeaderCellDef>Site</th>
                      <td mat-cell *matCellDef="let record">
                        <span class="site-name">{{ record.site }}</span>
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
                                  class="doc-button">
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
                  <mat-skeleton-loader *ngFor="let i of [1,2,3,4,5]" 
                    [attr.aria-label]="'Chargement ligne ' + i"
                    [ngStyle]="{'width': '100%', 'height': '48px', 'margin-bottom': '8px'}">
                  </mat-skeleton-loader>
                </div>
              </ng-template>
          </mat-card-content>
        </mat-card>
      </div>

        <!-- Sous-liste Valorisation (si filtre = Recyclables) -->
        <div class="valuables-section" *ngIf="selectedFilter === 'recyclables' && !isLoading">
          <mat-card class="valuables-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>eco</mat-icon>
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
                  <button mat-raised-button color="primary" (click)="downloadReport()">
                    <mat-icon>download</mat-icon>
                    <span>Télécharger rapport PDF</span>
                  </button>
                </div>
              </div>

              <!-- Skeleton pour Valorisation -->
              <ng-template #valuablesSkeleton>
                <div class="valuables-skeleton">
                  <mat-skeleton-loader *ngFor="let i of [1,2,3,4,5]" 
                    [attr.aria-label]="'Chargement valorisation ' + i"
                    [ngStyle]="{'width': '100%', 'height': '40px', 'margin-bottom': '8px'}">
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
      padding: var(--spacing-lg);
    }

    /* En-tête Héro */
    .hero-section {
      margin-bottom: var(--spacing-xl);
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
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
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
      margin: 0 0 var(--spacing-sm) 0;
    }

    .last-updated {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 0.875rem;
      opacity: 0.7;
      margin-top: var(--spacing-sm);
    }

    .update-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .update-text {
      font-family: 'Roboto', sans-serif;
      font-weight: 400;
    }

    /* Section Métriques */
    .metrics-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
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
      padding: var(--spacing-lg);
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

    /* Filtres et Recherche */
    .filters-section {
      margin-bottom: var(--spacing-xl);
    }

    .filters-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
      flex-wrap: wrap;
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

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    /* Table */
    .table-section {
      margin-bottom: var(--spacing-lg);
    }

    .table-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--elevation-2);
    }

    .table-actions {
      margin-left: auto;
      display: flex;
      gap: var(--spacing-sm);
    }

    .table-container {
      overflow-x: auto;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .records-table {
      width: 100%;
      min-width: 800px;
    }

    .table-row {
      transition: background-color var(--transition-fast);
    }

    .table-row:hover {
      background-color: var(--color-surface-variant);
    }

    /* Cellules spécialisées */
    .date-time-cell {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .date {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .time {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .tonnage-value {
      font-weight: 600;
      color: var(--color-primary);
    }

    .site-name {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .documents-cell {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .doc-button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .doc-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Chips de type avec couleurs spécifiques */
    .type-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: white !important;
      font-weight: 500;
    }

    /* États d'erreur et vide */
    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      color: #dc2626;
      margin-bottom: var(--spacing-lg);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--color-text-muted);
      margin-bottom: var(--spacing-lg);
    }

    .empty-state h3 {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    .empty-state p {
      margin-bottom: var(--spacing-xl);
    }

    /* Section Valorisation */
    .valuables-section {
      margin-bottom: var(--spacing-xl);
    }

    .valuables-card {
      border-radius: var(--radius-lg);
      box-shadow: var(--elevation-2);
      border-left: 4px solid var(--color-primary);
    }

    .valuables-table-container {
      overflow-x: auto;
      margin-bottom: var(--spacing-xl);
    }

    .valuables-table {
      width: 100%;
      min-width: 600px;
    }

    .valuables-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      background-color: var(--color-surface-variant);
      border-radius: var(--radius-md);
      flex-wrap: wrap;
      gap: var(--spacing-lg);
    }

    .total-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .total-label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .total-value {
      font-family: 'Inter', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .total-amount {
      font-weight: 600;
      color: var(--color-primary);
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = true;
  hasError = false;
  animatedCount = 0;
  collectionCount = 127;
  selectedFilter = 'all';
  searchTerm = '';
  displayedColumns = ['dateHeure', 'type', 'tonnage', 'site', 'documents'];
  valuablesColumns = ['material', 'quantity', 'pricePerKg', 'total'];
  
  dataSource = new MatTableDataSource<PickupRecord>([]);
  valuablesDataSource = new MatTableDataSource<any>([]);
  valuablesLoading = false;
  valuablesReport: ValuablesReport | null = null;
  lastUpdated: Date | null = null;

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

  // Données supprimées car maintenant gérées par le service

  constructor(
    private iconService: IconService,
    private chartService: ChartService,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.animateCounter();
    this.loadPickups();
  }

  ngAfterViewInit(): void {
    // Attendre que la vue soit initialisée pour créer le graphique
    setTimeout(() => {
      this.loadSparklineChart();
    }, 100);
    
    // Configurer le tri et la pagination
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Nettoyer les graphiques
    this.chartService.destroyAllCharts();
  }

  private initializeData(): void {
    // Configuration du filtre personnalisé
    this.dataSource.filterPredicate = (data: PickupRecord, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.site.toLowerCase().includes(searchStr) ||
        data.type.toLowerCase().includes(searchStr) ||
        this.formatDate(data.date).toLowerCase().includes(searchStr) ||
        data.heure.toLowerCase().includes(searchStr)
      );
    };
  }

  loadPickups(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dashboardService.getPickups().subscribe({
      next: (pickups) => {
        this.dataSource.data = pickups;
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
    this.selectedFilter = event.value;
    this.applyFilter();
    
    // Charger les données valorisables si filtre = recyclables
    if (this.selectedFilter === 'recyclables') {
      this.loadValuablesReport();
    }
  }

  applyFilter(): void {
    // Appliquer le filtre de recherche
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    
    // Appliquer le filtre de type
    if (this.selectedFilter !== 'all') {
      const currentData = this.dataSource.data;
      const filteredData = currentData.filter(record => record.type === this.selectedFilter);
      this.dataSource.data = filteredData;
    }
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.searchTerm = '';
    this.dataSource.filter = '';
    this.loadPickups();
  }

  loadValuablesReport(): void {
    this.valuablesLoading = true;
    
    this.dashboardService.getValuablesReport().subscribe({
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
    this.dashboardService.downloadReport();
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

  getDocumentIcon(type: string): string {
    return this.dashboardService.getDocumentIcon(type);
  }

  getDocumentLabel(type: string): string {
    return this.dashboardService.getDocumentLabel(type);
  }

  getWasteTypeColor(type: string): string {
    return this.dashboardService.getWasteTypeColor(type);
  }

  formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  exportToCSV(): void {
    // Simulation de l'export CSV
    const csvData = this.dataSource.data.map(record => ({
      'Date': this.formatDate(record.date),
      'Heure': record.heure,
      'Type': this.getTypeLabel(record.type),
      'Tonnage': record.tonnage,
      'Site': record.site,
      'Documents': record.docs.map(doc => doc.name).join('; ')
    }));

    const csvContent = this.convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enlevements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Export CSV téléchargé avec succès', 'Fermer', {
      duration: 2000
    });
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ];
    
    return csvRows.join('\n');
  }
}