import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { DocumentService } from '../../../../services/document.service';
import { DocumentInfo } from '../../../../models/enlevement.model';

/**
 * Composant : Liste des documents (client)
 * - Onglet 1 : Documents d'enlèvement (BSDI, PV)
 * - Onglet 2 : Documents mensuels (Attestations, Factures)
 */
@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss']
})
export class DocumentsListComponent implements OnInit {
  documentsEnlevement: DocumentInfo[] = [];
  documentsMensuels: DocumentInfo[] = [];
  loading = false;

  displayedColumns = ['typeDocument', 'fileName', 'enlevementNumero', 'periodeMois', 'uploadedAt', 'actions'];

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocumentsEnlevement();
    this.loadDocumentsMensuels();
  }

  loadDocumentsEnlevement(): void {
    this.loading = true;
    this.documentService.getDocumentsEnlevement().subscribe({
      next: (docs) => {
        this.documentsEnlevement = docs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.loading = false;
      }
    });
  }

  loadDocumentsMensuels(): void {
    this.loading = true;
    this.documentService.getDocumentsMensuels().subscribe({
      next: (docs) => {
        this.documentsMensuels = docs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement documents:', error);
        this.loading = false;
      }
    });
  }

  downloadDocument(doc: DocumentInfo): void {
    this.documentService.downloadDocument(doc);
  }

  getTypeDocumentLabel(type: string): string {
    const labels: any = {
      'BSDI': '📄 BSDI',
      'PV_DESTRUCTION': '📄 PV Destruction',
      'ATTESTATION_VALORISATION': '📜 Attestation Valorisation',
      'ATTESTATION_ELIMINATION': '📜 Attestation Élimination',
      'FACTURE': '🧾 Facture'
    };
    return labels[type] || type;
  }

  getFileIcon(mimeType?: string): string {
    if (!mimeType) return 'description';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('image')) return 'image';
    return 'description';
  }
}

