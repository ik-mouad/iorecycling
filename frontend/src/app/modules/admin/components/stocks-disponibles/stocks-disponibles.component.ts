import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VenteService } from '../../../../services/vente.service';
import { SocieteService } from '../../../../services/societe.service';
import { StockDisponible, StatutStock } from '../../../../models/vente.model';
import { Societe } from '../../../../models/societe.model';
import { I18nService } from '../../../../services/i18n.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

/**
 * Composant : Stocks disponibles à la vente (écran "À vendre / Non vendu")
 */
@Component({
  selector: 'app-stocks-disponibles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslatePipe
  ],
  templateUrl: './stocks-disponibles.component.html',
  styleUrls: ['./stocks-disponibles.component.scss']
})
export class StocksDisponiblesComponent implements OnInit {
  stocks: StockDisponible[] = [];
  loading = false;
  error: string | null = null;
  
  // Filtres
  societeId: number | null = null;
  societes: Societe[] = [];
  typeDechet: string | null = null;
  sousType: string | null = null;
  
  displayedColumns = ['numeroEnlevement', 'dateEnlevement', 'societeNom', 'typeDechet', 
                      'sousType', 'quantiteRecupereeKg', 'quantiteVendueKg', 
                      'resteAVendreKg', 'statutStock', 'actions'];
  
  // Base path pour les routes (admin ou comptable)
  private basePath: string = '/admin/ventes';
  
  constructor(
    private venteService: VenteService,
    private societeService: SocieteService,
    private router: Router,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}
  
  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable/ventes';
    } else {
      this.basePath = '/admin/ventes';
    }
    
    this.loadSocietes();
  }
  
  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 1000).subscribe({
      next: (page) => {
        this.societes = page.content;
        if (this.societes.length > 0 && !this.societeId) {
          this.societeId = this.societes[0].id;
          this.loadStocks();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sociétés', err);
        this.error = 'Erreur lors du chargement des sociétés';
      }
    });
  }
  
  loadStocks(): void {
    this.loading = true;
    this.error = null;
    
    this.venteService.getStocksDisponibles(
      this.societeId || undefined,
      this.typeDechet || undefined,
      this.sousType || undefined
    ).subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stocks', err);
        this.error = 'Erreur lors du chargement des stocks';
        this.loading = false;
      }
    });
  }
  
  onFilterChange(): void {
    this.loadStocks();
  }
  
  getStatutStockClass(statut: string): string {
    switch (statut) {
      case StatutStock.NON_VENDU:
        return 'statut-non-vendu';
      case StatutStock.PARTIELLEMENT_VENDU:
        return 'statut-partiellement-vendu';
      case StatutStock.VENDU:
        return 'statut-vendu';
      default:
        return '';
    }
  }
  
  getStatutStockLabel(statut: string): string {
    switch (statut) {
      case StatutStock.NON_VENDU:
        return this.i18n.t('stocks.statuts.nonVendu');
      case StatutStock.PARTIELLEMENT_VENDU:
        return this.i18n.t('stocks.statuts.partiellementVendu');
      case StatutStock.VENDU:
        return this.i18n.t('stocks.statuts.vendu');
      default:
        return statut;
    }
  }
  
  createVenteFromStock(stock: StockDisponible): void {
    // Navigation vers le formulaire de vente avec pré-remplissage
    this.router.navigate([this.basePath + '/nouvelle'], {
      queryParams: {
        pickupItemId: stock.pickupItemId,
        typeDechet: stock.typeDechet,
        sousType: stock.sousType || '',
        quantiteMax: stock.resteAVendreKg
      }
    });
  }
  
  viewEnlevement(enlevementId: number): void {
    // Pour les enlèvements, on garde la route admin car les comptables n'ont pas accès aux enlèvements
    // Si nécessaire, on peut ajouter une route comptable pour voir les enlèvements en lecture seule
    const enlevementPath = this.router.url.startsWith('/comptable') ? '/comptable/enlevements' : '/admin/enlevements';
    this.router.navigate([enlevementPath, enlevementId]);
  }
}
