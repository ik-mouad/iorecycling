import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PickupItem {
  material: string;
  qtyKg: number;
  priceMadPerKg: number;
  totalMad: number;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  description: string;
  fileSize?: number;
  mimeType?: string;
}

export interface Pickup {
  id: number;
  date: string;
  type: string;
  tonnageKg: number;
  site: string;
  documents: Document[];
  kgValorisables?: number;
  kgBanals?: number;
  kgDangereux?: number;
  items?: PickupItem[];
}

export interface CreatePickupRequest {
  clientId: number;
  date: string;
  type: 'RECYCLABLE' | 'BANAL' | 'DANGEREUX';
  siteId?: number;
  kgValorisables?: number;
  kgBanals?: number;
  kgDangereux?: number;
  items?: PickupItem[];
}

export interface PickupFilters {
  clientId?: number;
  type?: string;
  siteId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

/**
 * Service pour la gestion administrative des enlèvements
 */
@Injectable({
  providedIn: 'root'
})
export class AdminPickupService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Liste les enlèvements avec filtres
   */
  getPickups(filters: PickupFilters = {}): Observable<{ content: Pickup[], totalElements: number, totalPages: number }> {
    let params = new HttpParams();
    
    if (filters.clientId) params = params.set('clientId', filters.clientId.toString());
    if (filters.type) params = params.set('type', filters.type);
    if (filters.siteId) params = params.set('siteId', filters.siteId.toString());
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());

    return this.http.get<{ content: Pickup[], totalElements: number, totalPages: number }>(`${this.baseUrl}/pickups`, { params });
  }

  /**
   * Récupère un enlèvement par ID
   */
  getPickup(id: number): Observable<Pickup> {
    return this.http.get<Pickup>(`${this.baseUrl}/pickups/${id}`);
  }

  /**
   * Crée un nouvel enlèvement
   */
  createPickup(pickup: CreatePickupRequest): Observable<Pickup> {
    return this.http.post<Pickup>(`${this.baseUrl}/pickups`, pickup);
  }

  /**
   * Met à jour un enlèvement
   */
  updatePickup(id: number, pickup: CreatePickupRequest): Observable<Pickup> {
    return this.http.put<Pickup>(`${this.baseUrl}/pickups/${id}`, pickup);
  }

  /**
   * Supprime un enlèvement
   */
  deletePickup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pickups/${id}`);
  }

  /**
   * Liste les documents d'un enlèvement
   */
  getPickupDocuments(pickupId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.baseUrl}/pickups/${pickupId}/documents`);
  }

  /**
   * Upload un document pour un enlèvement
   */
  uploadDocument(pickupId: number, file: File, docType: string): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    return this.http.post<Document>(`${this.baseUrl}/pickups/${pickupId}/documents`, formData);
  }

  /**
   * Supprime un document
   */
  deleteDocument(pickupId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pickups/${pickupId}/documents/${documentId}`);
  }
}
