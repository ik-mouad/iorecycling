import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EnlevementService } from '../../../../services/enlevement.service';
import { DocumentService } from '../../../../services/document.service';
import { Enlevement, DocumentInfo } from '../../../../models/enlevement.model';
import { DocumentUploadComponent, DocumentUploadData } from '../document-upload/document-upload.component';
import { TypeTraitement } from '../../../../models/destination.model';

/**
 * Composant : Détail d'un enlèvement
 */
@Component({
  selector: 'app-enlevement-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './enlevement-detail.component.html',
  styleUrls: ['./enlevement-detail.component.scss']
})
export class EnlevementDetailComponent implements OnInit {
  enlevement?: Enlevement;
  documents: DocumentInfo[] = [];
  loading = false;
  loadingDocuments = false;
  displayedColumns = ['typeDechet', 'sousType', 'quantiteKg', 'etat', 'prixUnitaireMad', 'montant'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enlevementService: EnlevementService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadEnlevement(id);
      }
    });
  }

  loadEnlevement(id: number): void {
    this.loading = true;
    this.enlevementService.getEnlevementById(id).subscribe({
      next: (enlevement) => {
        this.enlevement = enlevement;
        this.loading = false;
        this.loadDocuments(id);
      },
      error: (error) => {
        console.error('Erreur chargement enlèvement:', error);
        this.snackBar.open('Erreur lors du chargement de l\'enlèvement', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.backToList();
      }
    });
  }

  loadDocuments(enlevementId: number): void {
    this.loadingDocuments = true;
    this.documentService.getDocumentsByEnlevement(enlevementId).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loadingDocuments = false;
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.loadingDocuments = false;
      }
    });
  }

  uploadDocument(): void {
    if (!this.enlevement) {
      return;
    }

    const dialogRef = this.dialog.open(DocumentUploadComponent, {
      width: '600px',
      data: {
        enlevementId: this.enlevement.id,
        type: 'enlevement'
      } as DocumentUploadData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.enlevement) {
        this.snackBar.open('Document uploadé avec succès', 'Fermer', { duration: 3000 });
        this.loadDocuments(this.enlevement.id);
      }
    });
  }

  downloadDocument(document: DocumentInfo): void {
    this.documentService.downloadDocument(document);
  }

  deleteDocument(document: DocumentInfo): void {
    if (confirm(`Supprimer le document "${document.fileName}" ?`)) {
      this.documentService.deleteDocument(document.id).subscribe({
        next: () => {
          this.snackBar.open('Document supprimé', 'Fermer', { duration: 3000 });
          if (this.enlevement) {
            this.loadDocuments(this.enlevement.id);
          }
        },
        error: (error) => {
          console.error('Erreur suppression document:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  backToList(): void {
    this.router.navigate(['/admin/enlevements']);
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

  getTypeDechetLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'RECYCLABLE': 'Recyclable',
      'A_DETRUIRE': 'À détruire',
      'DANGEREUX': 'Dangereux'
    };
    return labels[type] || type;
  }

  getTreatmentTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      [TypeTraitement.RECYCLAGE]: '♻️ Recyclage',
      [TypeTraitement.REUTILISATION]: '🔄 Réutilisation',
      [TypeTraitement.ENFOUISSEMENT]: '🗑️ Enfouissement',
      [TypeTraitement.INCINERATION]: '🔥 Incinération',
      [TypeTraitement.VALORISATION_ENERGETIQUE]: '⚡ Valorisation Énergétique',
      [TypeTraitement.DENATURATION_DESTRUCTION]: '☣️ Dénaturation/Destruction',
      [TypeTraitement.TRAITEMENT]: '🧪 Traitement'
    };
    return labels[type] || type;
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    // Format HH:mm:ss ou HH:mm -> HH:mm
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    // Format ISO date string -> dd/MM/yyyy
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

