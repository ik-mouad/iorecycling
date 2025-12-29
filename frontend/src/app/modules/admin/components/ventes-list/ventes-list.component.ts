import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Router, ActivatedRoute } from '@angular/router';
import { VenteService } from '../../../../services/vente.service';
import { Vente, StatutVente } from '../../../../models/vente.model';
import { Page } from '../../../../models/societe.model';

/**
 * Composant : Liste des ventes
 */
@Component({
  selector: 'app-ventes-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './ventes-list.component.html',
  styleUrls: ['./ventes-list.component.scss']
})
export class VentesListComponent implements OnInit {
  ventes: Vente[] = [];
  displayedColumns: string[] = ['numeroVente', 'dateVente', 'acheteurNom', 'statut', 'total', 'actions'];
  
  // Exposer l'enum pour le template
  StatutVente = StatutVente;
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  // Filtres
  statutFilter: StatutVente | null = null;
  
  loading = false;

  // Base path pour les routes (admin ou comptable)
  private basePath: string = '/admin/ventes';

  constructor(
    private venteService: VenteService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Détecter le contexte (admin ou comptable) depuis l'URL
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/comptable')) {
      this.basePath = '/comptable/ventes';
    } else {
      this.basePath = '/admin/ventes';
    }
    
    this.loadVentes();
  }

  loadVentes(): void {
    this.loading = true;
    
    const observable = this.statutFilter
      ? this.venteService.getVentesByStatut(this.statutFilter, this.pageIndex, this.pageSize)
      : this.venteService.getAllVentes(this.pageIndex, this.pageSize);

    observable.subscribe({
      next: (page: Page<Vente>) => {
        this.ventes = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement ventes:', error);
        this.snackBar.open('Erreur lors du chargement des ventes', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVentes();
  }

  filterByStatut(statut: StatutVente | null): void {
    this.statutFilter = statut;
    this.pageIndex = 0;
    this.loadVentes();
  }

  createVente(): void {
    this.router.navigate([this.basePath + '/nouvelle']);
  }

  viewVente(vente: Vente): void {
    this.router.navigate([this.basePath, vente.id]);
  }

  validerVente(vente: Vente): void {
    if (vente.statut !== StatutVente.BROUILLON) {
      this.snackBar.open('Seules les ventes en brouillon peuvent être validées', 'Fermer', { duration: 3000 });
      return;
    }

    this.venteService.validerVente(vente.id).subscribe({
      next: () => {
        this.snackBar.open(`Vente ${vente.numeroVente} validée avec succès`, 'Fermer', { duration: 5000 });
        this.loadVentes();
      },
      error: (error) => {
        console.error('Erreur validation vente:', error);
        this.snackBar.open('Erreur lors de la validation de la vente', 'Fermer', { duration: 3000 });
      }
    });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case StatutVente.BROUILLON:
        return 'statut-brouillon';
      case StatutVente.VALIDEE:
        return 'statut-validee';
      case StatutVente.ANNULEE:
        return 'statut-annulee';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case StatutVente.BROUILLON:
        return 'Brouillon';
      case StatutVente.VALIDEE:
        return 'Validée';
      case StatutVente.ANNULEE:
        return 'Annulée';
      default:
        return statut;
    }
  }

  calculateTotal(vente: Vente): number {
    return vente.items.reduce((total, item) => total + item.montantVenteMad, 0);
  }
}
