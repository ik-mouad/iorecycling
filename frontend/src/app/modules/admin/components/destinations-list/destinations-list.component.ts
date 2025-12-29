import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { DestinationService } from '../../../../services/destination.service';
import { Destination, TypeTraitement } from '../../../../models/destination.model';

/**
 * Composant : Liste des destinations
 * Affiche toutes les destinations avec pagination, recherche et actions CRUD
 */
@Component({
  selector: 'app-destinations-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './destinations-list.component.html',
  styleUrls: ['./destinations-list.component.scss']
})
export class DestinationsListComponent implements OnInit {
  destinations: Destination[] = [];
  displayedColumns: string[] = ['raisonSociale', 'site', 'typesTraitement', 'nomInterlocuteur', 'telInterlocuteur', 'actions'];
  
  // Search
  searchQuery = '';
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  loading = false;

  constructor(
    private destinationService: DestinationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.loading = true;
    this.destinationService.getAllDestinations(
      this.pageIndex, 
      this.pageSize,
      'raisonSociale,asc',
      this.searchQuery || undefined
    ).subscribe({
      next: (page) => {
        this.destinations = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement destinations:', error);
        this.snackBar.open('Erreur lors du chargement des destinations', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDestinations();
  }

  search(): void {
    this.pageIndex = 0;
    this.loadDestinations();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.pageIndex = 0;
    this.loadDestinations();
  }

  createDestination(): void {
    this.router.navigate(['/admin/destinations/new']);
  }

  editDestination(destination: Destination): void {
    this.router.navigate(['/admin/destinations', destination.id, 'edit']);
  }

  deleteDestination(destination: Destination): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la destination ${destination.raisonSociale} - ${destination.site} ?`)) {
      return;
    }

    this.destinationService.deleteDestination(destination.id).subscribe({
      next: () => {
        this.snackBar.open('Destination supprimée avec succès', 'Fermer', { duration: 3000 });
        this.loadDestinations();
      },
      error: (error) => {
        console.error('Erreur suppression destination:', error);
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
      }
    });
  }

  getTypeTraitementLabel(type: TypeTraitement): string {
    const labels: { [key in TypeTraitement]: string } = {
      [TypeTraitement.RECYCLAGE]: 'Recyclage',
      [TypeTraitement.REUTILISATION]: 'Réutilisation',
      [TypeTraitement.ENFOUISSEMENT]: 'Enfouissement',
      [TypeTraitement.INCINERATION]: 'Incinération',
      [TypeTraitement.VALORISATION_ENERGETIQUE]: 'Valorisation énergétique',
      [TypeTraitement.DENATURATION_DESTRUCTION]: 'Dénaturation/Destruction',
      [TypeTraitement.TRAITEMENT]: 'Traitement'
    };
    return labels[type] || type;
  }
}

