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
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { AuthenticatedLayoutComponent } from '../authenticated-layout/authenticated-layout.component';
import { DashboardService, PickupRecord, ValorSummary } from '../../services/dashboard.service';
import { ChartService } from '../../services/chart.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

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
    MatDividerModule,
    FormsModule,
    AuthenticatedLayoutComponent,
    TranslatePipe
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  // KPIs
  pickupsCount = 0;
  recyclablesTonnage = 0;
  banalsTonnage = 0;
  dangereuxTonnage = 0;
  totalRevenue = 0;

  // Table data
  displayedColumns: string[] = ['date', 'heure', 'type', 'tonnage', 'site', 'documents'];
  dataSource = new MatTableDataSource<PickupRecord>([]);
  filteredDataSource = new MatTableDataSource<PickupRecord>([]);

  // Filters
  selectedFilter = 'all';
  searchTerm = '';

  // Loading states
  isLoadingKPIs = true;
  isLoadingTable = true;
  isLoadingReport = false;
  
  // Skeleton states
  showKPISkeletons = true;
  showTableSkeletons = true;
  
  // Animation
  animatedPickupsCount = 0;
  lastRefreshTime: Date | null = null;

  // Valorization report
  valorizationReport: ValorSummary | null = null;
  showValorizationDetails = false;

  // Chart
  revenueChart: Chart | null = null;

  constructor(
    private dashboardService: DashboardService,
    private chartService: ChartService,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadKPIs();
    this.loadPickups();
    this.loadValuablesReport();
    this.initializeChart();
  }

  ngAfterViewInit(): void {
    // Attendre que les ViewChild soient disponibles
    setTimeout(() => {
      this.initializeTable();
    }, 100);
  }

  /**
   * Initialise le tableau avec pagination et tri
   */
  private initializeTable(): void {
    try {
      if (this.paginator && this.filteredDataSource) {
        this.filteredDataSource.paginator = this.paginator;
      }
      if (this.sort && this.filteredDataSource) {
        this.filteredDataSource.sort = this.sort;
      }
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation du tableau:', error);
    }
  }

  /**
   * Charge les KPIs du dashboard
   */
  loadKPIs(): void {
    this.isLoadingKPIs = true;
    this.showKPISkeletons = true;
    
    // Simulation de données - à remplacer par des appels API réels
    setTimeout(() => {
      this.pickupsCount = 42;
        this.recyclablesTonnage = 15.5;
      this.banalsTonnage = 8.2;
      this.dangereuxTonnage = 2.1;
      this.totalRevenue = 12500;
      this.isLoadingKPIs = false;
      this.showKPISkeletons = false;
      this.lastRefreshTime = new Date();
      
      // Animer le compteur
      this.animateCounter();
    }, 1000);
  }
  
  /**
   * Anime le compteur de pickups
   */
  private animateCounter(): void {
    const target = this.pickupsCount;
    const duration = 800; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.animatedPickupsCount = Math.floor(target * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animatedPickupsCount = target;
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Charge la liste des enlèvements
   */
  loadPickups(): void {
    this.isLoadingTable = true;
    
    this.dashboardService.getPickups(0, 50, this.selectedFilter.toUpperCase()).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.applyFilters();
        this.isLoadingTable = false;
        
        // Réinitialiser le tableau après le chargement des données
        setTimeout(() => {
          this.initializeTable();
        }, 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enlèvements:', error);
        this.snackBar.open(this.i18n.t('errors.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.isLoadingTable = false;
      }
    });
  }

  /**
   * Charge le rapport des recyclables
   */
  loadValuablesReport(): void {
    this.dashboardService.getValuablesReport().subscribe({
      next: (report) => {
        this.valorizationReport = report;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport recyclables:', error);
      }
    });
  }

  /**
   * Initialise le graphique de revenus
   */
  initializeChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Revenus (MAD)',
            data: [8500, 9200, 10800, 11200, 11800, 12500],
            borderColor: '#0E9F6E',
            backgroundColor: 'rgba(14, 159, 110, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      };
      
      this.revenueChart = new Chart(ctx, config);
    }
  }

  /**
   * Applique les filtres sur la table
   */
  applyFilters(): void {
    let filteredData = [...this.dataSource.data];

    // Filtre par type
    if (this.selectedFilter !== 'all') {
      filteredData = filteredData.filter(item => item.type === this.selectedFilter);
    }

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.site.toLowerCase().includes(term) ||
        item.type.toLowerCase().includes(term)
      );
    }

    this.filteredDataSource.data = filteredData;
  }

  /**
   * Gère le changement de filtre
   */
  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.loadPickups();
    
    // Afficher les détails recyclables si filtre "recyclables"
    this.showValorizationDetails = filter === 'recyclables';
  }

  /**
   * Gère la recherche
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Télécharge un document
   */
  downloadDocument(url: string, filename: string): void {
    this.dashboardService.downloadDocument(url, filename);
  }

  /**
   * Télécharge le rapport PDF
   */
  downloadReport(): void {
    this.isLoadingReport = true;
    this.dashboardService.downloadReport();
    
    setTimeout(() => {
      this.isLoadingReport = false;
      this.snackBar.open(this.i18n.t('success.saved'), this.i18n.t('common.close'), { duration: 3000 });
    }, 1000);
  }

  /**
   * Formate un nombre avec des espaces comme séparateurs de milliers
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  /**
   * Formate un montant en MAD
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(value);
  }

  /**
   * Retourne la classe CSS pour le type d'enlèvement
   */
  getTypeClass(type: string): string {
    switch (type) {
      case 'recyclables': return 'type-recyclables';
      case 'banals': return 'type-banals';
      case 'dangereux': return 'type-dangereux';
      default: return '';
    }
  }

  /**
   * Retourne le libellé du type d'enlèvement
   */
  getTypeLabel(type: string): string {
    switch (type) {
      case 'recyclables': return this.i18n.t('dashboard.recyclables');
      case 'banals': return this.i18n.t('dashboard.banals');
      case 'dangereux': return this.i18n.t('dashboard.dangereuxFilter');
      default: return type;
    }
  }

  /**
   * Retourne l'icône pour le type de document
   */
  getDocumentIcon(type: string): string {
    switch (type) {
      case 'bordereau': return 'description';
      case 'certificat': return 'verified';
      case 'facture': return 'receipt';
      case 'photo': return 'photo_camera';
      default: return 'attachment';
    }
  }
}