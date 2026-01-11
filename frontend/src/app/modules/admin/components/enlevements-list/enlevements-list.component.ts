import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EnlevementService } from '../../../../services/enlevement.service';
import { SocieteService } from '../../../../services/societe.service';
import { Enlevement } from '../../../../models/enlevement.model';
import { Societe } from '../../../../models/societe.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

/**
 * Composant : Liste des enlèvements avec filtres
 */
@Component({
  selector: 'app-enlevements-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    TranslatePipe
  ],
  templateUrl: './enlevements-list.component.html',
  styleUrls: ['./enlevements-list.component.scss']
})
export class EnlevementsListComponent implements OnInit {
  enlevements: Enlevement[] = [];
  displayedColumns: string[] = ['numeroEnlevement', 'dateEnlevement', 'societeNom', 'siteNom', 'poidsTotal', 'budgetRecyclage', 'budgetTraitement', 'bilanNet', 'tauxRecyclage', 'actions'];
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  // Filtres
  filterForm!: FormGroup;
  societes: Societe[] = [];
  
  loading = false;

  constructor(
    private enlevementService: EnlevementService,
    private societeService: SocieteService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadSocietes();
    this.loadEnlevements();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      societeId: ['']
    });
  }

  loadSocietes(): void {
    this.societeService.getAllSocietes(0, 100).subscribe({
      next: (page) => {
        this.societes = page.content;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés:', error);
      }
    });
  }

  loadEnlevements(): void {
    this.loading = true;
    const societeId = this.filterForm.value.societeId || undefined;

    this.enlevementService.getEnlevements(societeId, this.pageIndex, this.pageSize)
      .subscribe({
        next: (page) => {
          this.enlevements = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement enlèvements:', error);
          this.snackBar.open('Erreur lors du chargement des enlèvements', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadEnlevements();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadEnlevements();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEnlevements();
  }

  createEnlevement(): void {
    this.router.navigate(['/admin/enlevements/new']);
  }

  viewEnlevement(enlevement: Enlevement): void {
    this.router.navigate(['/admin/enlevements', enlevement.id]);
  }

  getBilanClass(bilanNet: number): string {
    return bilanNet >= 0 ? 'bilan-positif' : 'bilan-negatif';
  }

  getTauxClass(taux: number): string {
    if (taux >= 85) return 'excellent';
    if (taux >= 70) return 'tres-bon';
    if (taux >= 50) return 'bon';
    if (taux >= 30) return 'correct';
    return 'insuffisant';
  }

  onPageSizeChange(event: any): void {
    this.pageSize = event.value;
    this.pageIndex = 0;
    this.loadEnlevements();
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadEnlevements();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
      this.loadEnlevements();
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

