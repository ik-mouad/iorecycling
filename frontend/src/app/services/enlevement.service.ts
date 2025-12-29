import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enlevement, CreateEnlevementRequest } from '../models/enlevement.model';
import { Page } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Enlèvements
 * Consomme les APIs du backend AdminEnlevementController et ClientEnlevementController
 */
@Injectable({
  providedIn: 'root'
})
export class EnlevementService {
  private adminApiUrl = `${environment.apiUrl}/admin/enlevements`;
  private clientApiUrl = `${environment.apiUrl}/client/enlevements`;

  constructor(private http: HttpClient) {}

  /**
   * Crée un nouvel enlèvement (admin)
   */
  createEnlevement(request: CreateEnlevementRequest): Observable<Enlevement> {
    return this.http.post<Enlevement>(this.adminApiUrl, request);
  }

  /**
   * Récupère un enlèvement par son ID (admin)
   */
  getEnlevementById(id: number): Observable<Enlevement> {
    return this.http.get<Enlevement>(`${this.adminApiUrl}/${id}`);
  }

  /**
   * Liste les enlèvements (paginé) - Admin
   */
  getEnlevements(societeId?: number, page: number = 0, size: number = 20): Observable<Page<Enlevement>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (societeId) {
      params = params.set('societeId', societeId.toString());
    }

    return this.http.get<Page<Enlevement>>(this.adminApiUrl, { params });
  }

  /**
   * Récupère un enlèvement par son ID (client)
   */
  getClientEnlevementById(id: number): Observable<Enlevement> {
    return this.http.get<Enlevement>(`${this.clientApiUrl}/${id}`);
  }

  /**
   * Liste les enlèvements de la société du client (paginé)
   */
  getClientEnlevements(page: number = 0, size: number = 20): Observable<Page<Enlevement>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Enlevement>>(this.clientApiUrl, { params });
  }

  /**
   * Recherche des enlèvements par société et période (admin)
   */
  searchEnlevements(societeId: number, dateDebut: string, dateFin: string): Observable<Enlevement[]> {
    const params = new HttpParams()
      .set('societeId', societeId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<Enlevement[]>(`${this.adminApiUrl}/search`, { params });
  }

  /**
   * Supprime un enlèvement (admin uniquement)
   */
  deleteEnlevement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }

  /**
   * Récupère les transactions d'un enlèvement
   */
  getEnlevementTransactions(id: number): Observable<import('../models/comptabilite.model').Transaction[]> {
    return this.http.get<import('../models/comptabilite.model').Transaction[]>(`${this.adminApiUrl}/${id}/transactions`);
  }
}
