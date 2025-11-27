import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Societe, CreateSocieteRequest, UpdateSocieteRequest, Page } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Sociétés
 * Consomme les APIs du backend AdminSocieteController
 */
@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  private apiUrl = `${environment.apiUrl}/admin/societes`;

  constructor(private http: HttpClient) {}

  /**
   * Liste toutes les sociétés (paginé)
   */
  getAllSocietes(page: number = 0, size: number = 20, sort: string = 'raisonSociale,asc'): Observable<Page<Societe>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<Societe>>(this.apiUrl, { params });
  }

  /**
   * Récupère une société par son ID
   */
  getSocieteById(id: number): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle société
   */
  createSociete(request: CreateSocieteRequest): Observable<Societe> {
    return this.http.post<Societe>(this.apiUrl, request);
  }

  /**
   * Met à jour une société existante
   */
  updateSociete(id: number, request: UpdateSocieteRequest): Observable<Societe> {
    return this.http.put<Societe>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprime une société
   */
  deleteSociete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
