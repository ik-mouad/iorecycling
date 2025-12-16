import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination, CreateDestinationRequest, UpdateDestinationRequest, Page, TypeTraitement } from '../models/destination.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Destinations
 * Consomme les APIs du backend AdminDestinationController
 */
@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private apiUrl = `${environment.apiUrl}/admin/destinations`;

  constructor(private http: HttpClient) {}

  /**
   * Liste toutes les destinations (paginé)
   */
  getAllDestinations(
    page: number = 0, 
    size: number = 20, 
    sort: string = 'raisonSociale,asc',
    search?: string
  ): Observable<Page<Destination>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Page<Destination>>(this.apiUrl, { params });
  }

  /**
   * Liste toutes les destinations (pour sélection dans formulaire)
   */
  getAllDestinationsList(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.apiUrl}/all`);
  }

  /**
   * Liste les destinations pour déchets dangereux
   */
  getDestinationsPourDechetsDangereux(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.apiUrl}/dechets-dangereux`);
  }

  /**
   * Récupère une destination par son ID
   */
  getDestinationById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée une nouvelle destination
   */
  createDestination(request: CreateDestinationRequest): Observable<Destination> {
    return this.http.post<Destination>(this.apiUrl, request);
  }

  /**
   * Met à jour une destination existante
   */
  updateDestination(id: number, request: UpdateDestinationRequest): Observable<Destination> {
    return this.http.put<Destination>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprime une destination
   */
  deleteDestination(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les destinations compatibles avec certains types de traitement.
   */
  getDestinationsByTreatmentTypes(types: TypeTraitement[]): Observable<Destination[]> {
    let params = new HttpParams();
    types.forEach(type => {
      params = params.append('types', type);
    });
    return this.http.get<Destination[]>(`${this.apiUrl}/by-treatment-types`, { params });
  }
}

