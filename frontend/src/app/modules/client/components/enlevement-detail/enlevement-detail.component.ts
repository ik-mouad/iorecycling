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
import { MatTooltipModule } from '@angular/material/tooltip';
import { EnlevementService } from '../../../../services/enlevement.service';
import { DocumentService } from '../../../../services/document.service';
import { Enlevement, DocumentInfo } from '../../../../models/enlevement.model';

/**
 * Composant : Détail d'un enlèvement (client)
 */
@Component({
  selector: 'app-client-enlevement-detail',
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
    MatTooltipModule
  ],
  templateUrl: './enlevement-detail.component.html',
  styleUrls: ['./enlevement-detail.component.scss']
})
export class ClientEnlevementDetailComponent implements OnInit {
  enlevement?: Enlevement;
  documents: DocumentInfo[] = [];
  loading = false;
  loadingDocuments = false;
  displayedColumns = ['typeDechet', 'sousType', 'quantiteKg', 'prixUnitaireMad', 'montant'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enlevementService: EnlevementService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar
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
    this.enlevementService.getClientEnlevementById(id).subscribe({
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

  downloadDocument(document: DocumentInfo): void {
    this.documentService.downloadDocument(document);
  }

  backToList(): void {
    this.router.navigate(['/client/enlevements']);
  }

  getBilanClass(bilanNet: number): string {
    return bilanNet >= 0 ? 'bilan-positif' : 'bilan-negatif';
  }

  getTauxClass(taux: number): string {
    if (taux >= 85) return 'taux-excellent';
    if (taux >= 70) return 'taux-tres-bon';
    if (taux >= 50) return 'taux-bon';
    if (taux >= 30) return 'taux-correct';
    return 'taux-insuffisant';
  }

  getTypeDechetLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'VALORISABLE': 'Valorisable',
      'A_ELIMINER': 'À éliminer',
      'BANAL': 'Banal'
    };
    return labels[type] || type;
  }
}

