import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camion, CreateCamionRequest, UpdateCamionRequest, Page, TypeCamion } from '../models/camion.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Camions
 * Consomme les APIs du backend AdminCamionController
 */
@Injectable({
  providedIn: 'root'
})
export class CamionService {
  private apiUrl = `${environment.apiUrl}/admin/camions`;

  constructor(private http: HttpClient) {}

  /**
   * Liste tous les camions (paginé)
   */
  getAllCamions(
    page: number = 0, 
    size: number = 20, 
    sort: string = 'matricule,asc',
    actif?: boolean,
    societeProprietaireId?: number,
    typeCamion?: TypeCamion
  ): Observable<Page<Camion>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (actif !== undefined) {
      params = params.set('actif', actif.toString());
    }
    if (societeProprietaireId !== undefined) {
      params = params.set('societeProprietaireId', societeProprietaireId.toString());
    }
    if (typeCamion !== undefined) {
      params = params.set('typeCamion', typeCamion);
    }

    return this.http.get<Page<Camion>>(this.apiUrl, { params });
  }

  /**
   * Liste tous les camions actifs (pour sélection dans formulaire)
   */
  getActiveCamions(): Observable<Camion[]> {
    return this.http.get<Camion[]>(`${this.apiUrl}/actifs`);
  }

  /**
   * Récupère un camion par son ID
   */
  getCamionById(id: number): Observable<Camion> {
    return this.http.get<Camion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau camion
   */
  createCamion(request: CreateCamionRequest): Observable<Camion> {
    return this.http.post<Camion>(this.apiUrl, request);
  }

  /**
   * Met à jour un camion existant
   */
  updateCamion(id: number, request: UpdateCamionRequest): Observable<Camion> {
    return this.http.put<Camion>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprime un camion
   */
  deleteCamion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les camions actifs par société propriétaire
   */
  getActiveCamionsBySocieteProprietaire(societeProprietaireId: number): Observable<Camion[]> {
    return this.http.get<Camion[]>(`${this.apiUrl}/societe-proprietaire/${societeProprietaireId}/actifs`);
  }
}

