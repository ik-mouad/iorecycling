import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocieteProprietaire, CreateSocieteProprietaireRequest, UpdateSocieteProprietaireRequest, Page } from '../models/societe-proprietaire.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Sociétés Propriétaires de Camions
 * Consomme les APIs du backend AdminSocieteProprietaireController
 */
@Injectable({
  providedIn: 'root'
})
export class SocieteProprietaireService {
  private apiUrl = `${environment.apiUrl}/admin/societes-proprietaires`;

  constructor(private http: HttpClient) {}

  /**
   * Liste toutes les sociétés propriétaires (paginé)
   */
  getAllSocietesProprietaires(
    page: number = 0, 
    size: number = 20, 
    sort: string = 'raisonSociale,asc',
    search?: string
  ): Observable<Page<SocieteProprietaire>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Page<SocieteProprietaire>>(this.apiUrl, { params });
  }

  /**
   * Liste toutes les sociétés propriétaires actives (pour sélection dans formulaire)
   */
  getActiveSocietesProprietaires(): Observable<SocieteProprietaire[]> {
    return this.http.get<SocieteProprietaire[]>(`${this.apiUrl}/actives`);
  }

  /**
   * Récupère une société propriétaire par son ID
   */
  getSocieteProprietaireById(id: number): Observable<SocieteProprietaire> {
    return this.http.get<SocieteProprietaire>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle société propriétaire
   */
  createSocieteProprietaire(request: CreateSocieteProprietaireRequest): Observable<SocieteProprietaire> {
    return this.http.post<SocieteProprietaire>(this.apiUrl, request);
  }

  /**
   * Met à jour une société propriétaire existante
   */
  updateSocieteProprietaire(id: number, request: UpdateSocieteProprietaireRequest): Observable<SocieteProprietaire> {
    return this.http.put<SocieteProprietaire>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprime une société propriétaire
   */
  deleteSocieteProprietaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

