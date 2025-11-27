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
    MatInputModule
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
    private dialog: MatDialog
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
        this.snackBar.open('Erreur lors du chargement des demandes', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  validerDemande(demande: DemandeEnlevement): void {
    if (confirm(`Valider la demande "${demande.numeroDemande}" ?`)) {
      this.demandeService.validerDemande(demande.id).subscribe({
        next: () => {
          this.snackBar.open('Demande validée avec succès', 'Fermer', { duration: 3000 });
          this.loadDemandes();
        },
        error: (error) => {
          console.error('Erreur validation demande:', error);
          this.snackBar.open('Erreur lors de la validation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  refuserDemande(demande: DemandeEnlevement): void {
    const motif = prompt('Motif du refus :');
    if (motif && motif.trim()) {
      this.demandeService.refuserDemande(demande.id, motif.trim()).subscribe({
        next: () => {
          this.snackBar.open('Demande refusée', 'Fermer', { duration: 3000 });
          this.loadDemandes();
        },
        error: (error) => {
          console.error('Erreur refus demande:', error);
          this.snackBar.open('Erreur lors du refus', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getStatutLabel(statut: string): string {
    return STATUT_LABELS[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'statut-en-attente',
      'VALIDEE': 'statut-validee',
      'PLANIFIEE': 'statut-planifiee',
      'REALISEE': 'statut-realisee',
      'REFUSEE': 'statut-refusee',
      'ANNULEE': 'statut-annulee'
    };
    return classes[statut] || '';
  }
}

