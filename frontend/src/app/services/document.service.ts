import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentInfo } from '../models/enlevement.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Documents
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload un document d'enlèvement (BSDI ou PV)
   */
  uploadDocumentEnlevement(
    enlevementId: number,
    typeDocument: string,
    file: File
  ): Observable<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('typeDocument', typeDocument);

    return this.http.post<DocumentInfo>(
      `${this.apiUrl}/admin/documents/enlevement/${enlevementId}`,
      formData
    );
  }

  /**
   * Upload un document mensuel (Attestation ou Facture)
   */
  uploadDocumentMensuel(
    societeId: number,
    typeDocument: string,
    periodeMois: string,
    file: File
  ): Observable<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('societeId', societeId.toString());
    formData.append('typeDocument', typeDocument);
    formData.append('periodeMois', periodeMois);

    return this.http.post<DocumentInfo>(
      `${this.apiUrl}/admin/documents/mensuel`,
      formData
    );
  }

  /**
   * Récupère les documents d'un enlèvement
   */
  getDocumentsByEnlevement(enlevementId: number): Observable<DocumentInfo[]> {
    return this.http.get<DocumentInfo[]>(
      `${this.apiUrl}/admin/documents/enlevement/${enlevementId}`
    );
  }

  /**
   * Récupère les documents d'enlèvement de la société (client)
   */
  getDocumentsEnlevement(): Observable<DocumentInfo[]> {
    return this.http.get<DocumentInfo[]>(`${this.apiUrl}/client/documents/enlevement`);
  }

  /**
   * Récupère les documents mensuels de la société (client)
   */
  getDocumentsMensuels(): Observable<DocumentInfo[]> {
    return this.http.get<DocumentInfo[]>(`${this.apiUrl}/client/documents/mensuels`);
  }

  /**
   * Récupère un document par son ID (avec URL de téléchargement)
   */
  getDocumentById(id: number): Observable<DocumentInfo> {
    return this.http.get<DocumentInfo>(`${this.apiUrl}/client/documents/${id}`);
  }

  /**
   * Supprime un document
   */
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/documents/${id}`);
  }

  /**
   * Télécharge un document (ouvre l'URL présignée)
   */
  downloadDocument(document: DocumentInfo): void {
    if (document.downloadUrl) {
      window.open(document.downloadUrl, '_blank');
    }
  }
}

