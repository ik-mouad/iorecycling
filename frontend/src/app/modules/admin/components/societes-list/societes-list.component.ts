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
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SocieteService } from '../../../../services/societe.service';
import { Societe } from '../../../../models/societe.model';

/**
 * Composant : Liste des sociétés
 * Affiche toutes les sociétés avec pagination et actions CRUD
 */
@Component({
  selector: 'app-societes-list',
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
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './societes-list.component.html',
  styleUrls: ['./societes-list.component.scss']
})
export class SocietesListComponent implements OnInit {
  societes: Societe[] = [];
  displayedColumns: string[] = ['raisonSociale', 'ice', 'email', 'telephone', 'nbSites', 'nbEnlevements', 'actions'];
  
  // Search & Filters
  searchQuery = '';
  selectedStatus = '';
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  loading = false;

  constructor(
    private societeService: SocieteService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSocietes();
  }

  loadSocietes(): void {
    this.loading = true;
    this.societeService.getAllSocietes(this.pageIndex, this.pageSize)
      .subscribe({
        next: (page) => {
          this.societes = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement sociétés:', error);
          this.snackBar.open('Erreur lors du chargement des sociétés', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSocietes();
  }

  createSociete(): void {
    this.router.navigate(['/admin/societes/new']);
  }

  editSociete(societe: Societe): void {
    this.router.navigate(['/admin/societes', societe.id, 'edit']);
  }

  viewSociete(societe: Societe): void {
    this.router.navigate(['/admin/societes', societe.id]);
  }

  onSearchChange(): void {
    // Debounce search - reload after 300ms of no typing
    // For now, simple implementation
    this.pageIndex = 0;
    this.loadSocietes();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadSocietes();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = event.value;
    this.pageIndex = 0;
    this.loadSocietes();
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadSocietes();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
      this.loadSocietes();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize);
  }

  getDisplayedRange(): string {
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.totalElements);
    return `${start} - ${end}`;
  }
}
