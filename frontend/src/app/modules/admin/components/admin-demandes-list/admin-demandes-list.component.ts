import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DemandeService } from '../../../../services/demande.service';
import { DemandeEnlevement, StatutDemande, STATUT_LABELS } from '../../../../models/demande.model';
import { ValiderDemandeDialogComponent } from '../valider-demande-dialog/valider-demande-dialog.component';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { I18nService } from '../../../../services/i18n.service';

/**
 * Composant : Liste des demandes d'enlèvements (Admin)
 * Permet de valider, refuser ou planifier les demandes
 */
@Component({
  selector: 'app-admin-demandes-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe
  ],
  templateUrl: './admin-demandes-list.component.html',
  styleUrls: ['./admin-demandes-list.component.scss']
})
export class AdminDemandesListComponent implements OnInit {
  demandes: DemandeEnlevement[] = [];
  displayedColumns: string[] = ['numeroDemande', 'societeNom', 'siteNom', 'dateSouhaitee', 'statut', 'actions'];
  loading = false;
  motifRefus = '';

  constructor(
    private demandeService: DemandeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.demandeService.getDemandesEnAttente().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement demandes:', error);
        this.snackBar.open(this.i18n.t('demande.loadError'), this.i18n.t('common.close'), { duration: 3000 });
        this.loading = false;
      }
    });
  }

  validerDemande(demande: DemandeEnlevement): void {
    const dialogRef = this.dialog.open(ValiderDemandeDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { demande }
    });

    dialogRef.afterClosed().subscribe((result: { dateModifiee?: string | null; heureModifiee?: string | null } | null) => {
      if (result !== null) {
        // L'utilisateur a validé (result peut être un objet avec date/heure modifiées ou un objet vide)
        this.demandeService.validerDemande(demande.id, result).subscribe({
          next: () => {
            const message = (result.dateModifiee || result.heureModifiee)
              ? this.i18n.t('demande.validatedWithChanges')
              : this.i18n.t('demande.validated');
            this.snackBar.open(message, this.i18n.t('common.close'), { duration: 3000 });
            this.loadDemandes();
          },
          error: (error) => {
            console.error('Erreur validation demande:', error);
            this.snackBar.open(this.i18n.t('demande.validationError'), this.i18n.t('common.close'), { duration: 3000 });
          }
        });
      }
      // Si null, l'utilisateur a annulé, on ne fait rien
    });
  }

  refuserDemande(demande: DemandeEnlevement): void {
    const motif = prompt(this.i18n.t('demande.refusalReason'));
    if (motif && motif.trim()) {
      this.demandeService.refuserDemande(demande.id, motif.trim()).subscribe({
        next: () => {
          this.snackBar.open(this.i18n.t('demande.refused'), this.i18n.t('common.close'), { duration: 3000 });
          this.loadDemandes();
        },
        error: (error) => {
          console.error('Erreur refus demande:', error);
          this.snackBar.open(this.i18n.t('demande.refusalError'), this.i18n.t('common.close'), { duration: 3000 });
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
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'en-attente',
      'VALIDEE': 'validee',
      'PLANIFIEE': 'planifiee',
      'REALISEE': 'realisee',
      'REFUSEE': 'refusee',
      'ANNULEE': 'annulee'
    };
    return classes[statut] || '';
  }
}

