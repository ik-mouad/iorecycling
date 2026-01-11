import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { DemandeService } from '../../../../services/demande.service';
import { DemandeEnlevement, STATUT_LABELS } from '../../../../models/demande.model';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

/**
 * Composant : Liste de mes demandes d'enlèvements (client)
 */
@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
    TranslatePipe
  ],
  templateUrl: './mes-demandes.component.html',
  styleUrls: ['./mes-demandes.component.scss']
})
export class MesDemandesComponent implements OnInit {
  demandes: DemandeEnlevement[] = [];
  displayedColumns = ['numeroDemande', 'dateSouhaitee', 'siteNom', 'quantiteEstimee', 'statut', 'dateCreation', 'actions'];
  
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  loading = false;

  constructor(
    private demandeService: DemandeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.demandeService.getMesDemandes(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.demandes = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement demandes:', error);
        this.snackBar.open(this.i18n.t('errors.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDemandes();
  }

  createDemande(): void {
    this.router.navigate(['/client/demandes/new']);
  }

  annulerDemande(demande: DemandeEnlevement): void {
    if (confirm(this.i18n.t('demande.confirmCancel', { numero: demande.numeroDemande }))) {
      this.demandeService.annulerDemande(demande.id).subscribe({
        next: () => {
          this.snackBar.open(this.i18n.t('demande.cancelled'), this.i18n.t('common.close'), { duration: 3000 });
          this.loadDemandes();
        },
        error: (error) => {
          console.error('Erreur annulation:', error);
          this.snackBar.open(this.i18n.t('demande.cancelError'), this.i18n.t('common.close'), { duration: 3000 });
        }
      });
    }
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': this.i18n.t('demande.statutEnAttente'),
      'VALIDEE': this.i18n.t('demande.statutValidee'),
      'PLANIFIEE': this.i18n.t('demande.statutPlanifiee'),
      'REALISEE': this.i18n.t('demande.statutRealisee'),
      'REFUSEE': this.i18n.t('demande.statutRefusee'),
      'ANNULEE': this.i18n.t('demande.statutAnnulee')
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'EN_ATTENTE': 'attente',
      'VALIDEE': 'validee',
      'PLANIFIEE': 'planifiee',
      'REALISEE': 'realisee',
      'REFUSEE': 'refusee',
      'ANNULEE': 'annulee'
    };
    return classes[statut] || '';
  }

  canAnnuler(demande: DemandeEnlevement): boolean {
    return demande.statut === 'EN_ATTENTE' || demande.statut === 'VALIDEE';
  }

  onPageSizeChange(event: any): void {
    this.pageSize = event.value;
    this.pageIndex = 0;
    this.loadDemandes();
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadDemandes();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.getTotalPages() - 1) {
      this.pageIndex++;
      this.loadDemandes();
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

