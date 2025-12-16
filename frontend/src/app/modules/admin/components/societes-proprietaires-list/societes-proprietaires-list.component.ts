import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { SocieteProprietaireService } from '../../../../services/societe-proprietaire.service';
import { SocieteProprietaire } from '../../../../models/societe-proprietaire.model';
import { Page } from '../../../../models/societe-proprietaire.model';

/**
 * Composant : Liste des sociétés propriétaires de camions
 */
@Component({
  selector: 'app-societes-proprietaires-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './societes-proprietaires-list.component.html',
  styleUrls: ['./societes-proprietaires-list.component.scss']
})
export class SocietesProprietairesListComponent implements OnInit {
  societesProprietaires: SocieteProprietaire[] = [];
  displayedColumns: string[] = ['raisonSociale', 'contact', 'actif', 'actions'];

  // Search & Filters
  searchTerm = '';

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  loading = false;

  constructor(
    private societeProprietaireService: SocieteProprietaireService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSocietesProprietaires();
  }

  loadSocietesProprietaires(): void {
    this.loading = true;
    this.societeProprietaireService.getAllSocietesProprietaires(
      this.pageIndex, 
      this.pageSize, 
      'raisonSociale,asc',
      this.searchTerm
    ).subscribe({
      next: (page: Page<SocieteProprietaire>) => {
        this.societesProprietaires = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés propriétaires:', error);
        this.snackBar.open('Erreur lors du chargement des sociétés propriétaires', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadSocietesProprietaires();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSocietesProprietaires();
  }

  createSocieteProprietaire(): void {
    this.router.navigate(['/admin/societes-proprietaires/new']);
  }

  editSocieteProprietaire(societe: SocieteProprietaire): void {
    this.router.navigate(['/admin/societes-proprietaires', societe.id, 'edit']);
  }

  deleteSocieteProprietaire(societe: SocieteProprietaire): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la société propriétaire "${societe.raisonSociale}" ?`)) {
      this.loading = true;
      this.societeProprietaireService.deleteSocieteProprietaire(societe.id).subscribe({
        next: () => {
          this.snackBar.open('Société propriétaire supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadSocietesProprietaires();
        },
        error: (error) => {
          console.error('Erreur suppression société propriétaire:', error);
          this.snackBar.open('Erreur lors de la suppression de la société propriétaire', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}

