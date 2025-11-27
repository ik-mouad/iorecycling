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
import { RecurrenceService } from '../../../../services/recurrence.service';
import { Recurrence, TypeRecurrence } from '../../../../models/planning.model';
import { RecurrenceFormComponent, RecurrenceFormData } from '../recurrence-form/recurrence-form.component';

/**
 * Composant : Liste des récurrences
 */
@Component({
  selector: 'app-recurrences-list',
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
    MatTooltipModule
  ],
  templateUrl: './recurrences-list.component.html',
  styleUrls: ['./recurrences-list.component.scss']
})
export class RecurrencesListComponent implements OnInit {
  recurrences: Recurrence[] = [];
  displayedColumns: string[] = ['societeNom', 'siteNom', 'typeRecurrence', 'details', 'periode', 'active', 'actions'];
  loading = false;

  constructor(
    private recurrenceService: RecurrenceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRecurrences();
  }

  loadRecurrences(): void {
    this.loading = true;
    this.recurrenceService.getRecurrencesActives().subscribe({
      next: (recurrences) => {
        this.recurrences = recurrences;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement récurrences:', error);
        this.snackBar.open('Erreur lors du chargement des récurrences', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  addRecurrence(): void {
    const dialogRef = this.dialog.open(RecurrenceFormComponent, {
      width: '600px',
      data: {} as RecurrenceFormData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Récurrence créée avec succès', 'Fermer', { duration: 3000 });
        this.loadRecurrences();
      }
    });
  }

  desactiverRecurrence(recurrence: Recurrence): void {
    if (confirm(`Désactiver la récurrence pour ${recurrence.societeNom} ?`)) {
      this.recurrenceService.desactiverRecurrence(recurrence.id).subscribe({
        next: () => {
          this.snackBar.open('Récurrence désactivée', 'Fermer', { duration: 3000 });
          this.loadRecurrences();
        },
        error: (error) => {
          console.error('Erreur désactivation récurrence:', error);
          this.snackBar.open('Erreur lors de la désactivation', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  supprimerRecurrence(recurrence: Recurrence): void {
    if (confirm(`Supprimer définitivement la récurrence pour ${recurrence.societeNom} ?`)) {
      this.recurrenceService.supprimerRecurrence(recurrence.id).subscribe({
        next: () => {
          this.snackBar.open('Récurrence supprimée', 'Fermer', { duration: 3000 });
          this.loadRecurrences();
        },
        error: (error) => {
          console.error('Erreur suppression récurrence:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getTypeRecurrenceLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'HEBDOMADAIRE': 'Hebdomadaire',
      'BIMENSUELLE': 'Bimensuelle',
      'MENSUELLE': 'Mensuelle',
      'PERSONNALISEE': 'Personnalisée'
    };
    return labels[type] || type;
  }

  getRecurrenceDetails(recurrence: Recurrence): string {
    if (recurrence.typeRecurrence === TypeRecurrence.HEBDOMADAIRE && recurrence.jourSemaine) {
      return `Chaque ${recurrence.jourSemaine}`;
    } else if (recurrence.typeRecurrence === TypeRecurrence.BIMENSUELLE && recurrence.joursSemaneBimensuel) {
      return `Les ${recurrence.joursSemaneBimensuel.replace(',', ' et ')}`;
    } else if (recurrence.typeRecurrence === TypeRecurrence.MENSUELLE && recurrence.jourMois) {
      return `Le ${recurrence.jourMois} de chaque mois`;
    }
    return '-';
  }
}

