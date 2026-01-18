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
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { CamionService } from '../../../../services/camion.service';
import { SocieteProprietaireService } from '../../../../services/societe-proprietaire.service';
import { Camion, TypeCamion } from '../../../../models/camion.model';
import { SocieteProprietaire } from '../../../../models/societe-proprietaire.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';
import { RoleService } from '../../../../services/role.service';

/**
 * Composant : Liste des camions
 * Affiche tous les camions avec pagination, filtres et actions CRUD
 */
@Component({
  selector: 'app-camions-list',
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
    MatInputModule,
    MatChipsModule,
    MatCardModule,
    TranslatePipe
  ],
  templateUrl: './camions-list.component.html',
  styleUrls: ['./camions-list.component.scss']
})
export class CamionsListComponent implements OnInit {
  camions: Camion[] = [];
  displayedColumns: string[] = ['matricule', 'typeCamion', 'tonnageMaxKg', 'societeProprietaireNom', 'actif', 'actions'];
  
  // Filters
  actifFilter: boolean | null = null;
  societeProprietaireFilter: number | null = null;
  typeCamionFilter: TypeCamion | null = null;
  societesProprietaires: SocieteProprietaire[] = [];
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  loading = false;
  typesCamion = Object.values(TypeCamion);

  constructor(
    private camionService: CamionService,
    private societeProprietaireService: SocieteProprietaireService,
    public router: Router,
    private snackBar: MatSnackBar,
    private i18n: I18nService,
    private roleService: RoleService
  ) {}
  
  canDelete(): boolean {
    return this.roleService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.loadSocietesProprietaires();
    this.loadCamions();
  }

  loadSocietesProprietaires(): void {
    this.societeProprietaireService.getAllSocietesProprietaires(0, 100).subscribe({
      next: (page) => {
        this.societesProprietaires = page.content;
      },
      error: (error) => {
        console.error('Erreur chargement sociétés propriétaires:', error);
      }
    });
  }

  loadCamions(): void {
    this.loading = true;
    this.camionService.getAllCamions(
      this.pageIndex, 
      this.pageSize,
      'matricule,asc',
      this.actifFilter !== null ? this.actifFilter : undefined,
      this.societeProprietaireFilter || undefined,
      this.typeCamionFilter || undefined
    ).subscribe({
      next: (page) => {
        this.camions = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement camions:', error);
        this.snackBar.open(this.i18n.t('camion.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCamions();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadCamions();
  }

  clearFilters(): void {
    this.actifFilter = null;
    this.societeProprietaireFilter = null;
    this.typeCamionFilter = null;
    this.pageIndex = 0;
    this.loadCamions();
  }

  createCamion(): void {
    this.router.navigate(['/admin/camions/new']);
  }

  editCamion(camion: Camion): void {
    this.router.navigate(['/admin/camions', camion.id, 'edit']);
  }

  deleteCamion(camion: Camion): void {
    if (!confirm(this.i18n.t('camion.confirmDelete', { matricule: camion.matricule }))) {
      return;
    }

    this.camionService.deleteCamion(camion.id).subscribe({
      next: () => {
        this.snackBar.open(this.i18n.t('camion.deleted'), this.i18n.t('common.close'), { duration: 3000 });
        this.loadCamions();
      },
      error: (error) => {
        console.error('Erreur suppression camion:', error);
        this.snackBar.open(this.i18n.t('errors.deleteError'), this.i18n.t('common.close'), { duration: 3000 });
      }
    });
  }

  getTypeCamionLabel(type: TypeCamion): string {
    const labels: { [key in TypeCamion]: string } = {
      [TypeCamion.PLATEAU]: this.i18n.t('camion.typePlateau'),
      [TypeCamion.CAISSON]: this.i18n.t('camion.typeCaisson'),
      [TypeCamion.AMPLIROLL]: this.i18n.t('camion.typeAmpliroll'),
      [TypeCamion.GRUE]: this.i18n.t('camion.typeGrue'),
      [TypeCamion.HYDROCUREUR]: this.i18n.t('camion.typeHydrocureur')
    };
    return labels[type] || type;
  }
}

