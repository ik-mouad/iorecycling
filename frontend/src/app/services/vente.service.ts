import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Vente,
  CreateVenteRequest,
  VenteItem,
  StockDisponible,
  StatutVente
} from '../models/vente.model';
import { Page } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les ventes de déchets
 */
@Injectable({
  providedIn: 'root'
})
export class VenteService {
  private venteApiUrl = `${environment.apiUrl}/admin/ventes`;

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle vente
   */
  createVente(request: CreateVenteRequest): Observable<Vente> {
    return this.http.post<Vente>(this.venteApiUrl, request);
  }

  /**
   * Valide une vente (génère les transactions comptables)
   */
  validerVente(venteId: number): Observable<Vente> {
    return this.http.post<Vente>(`${this.venteApiUrl}/${venteId}/valider`, {});
  }

  /**
   * Récupère une vente par ID
   */
  getVenteById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.venteApiUrl}/${id}`);
  }

  /**
   * Liste toutes les ventes avec pagination
   */
  getAllVentes(page: number = 0, size: number = 20): Observable<Page<Vente>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Vente>>(this.venteApiUrl, { params });
  }

  /**
   * Liste les ventes par statut
   */
  getVentesByStatut(statut: StatutVente, page: number = 0, size: number = 20): Observable<Page<Vente>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Vente>>(`${this.venteApiUrl}/statut/${statut}`, { params });
  }

  /**
   * Récupère les stocks disponibles à la vente
   */
  getStocksDisponibles(
    societeId?: number,
    typeDechet?: string,
    sousType?: string
  ): Observable<StockDisponible[]> {
    let params = new HttpParams();
    if (societeId) {
      params = params.set('societeId', societeId.toString());
    }
    if (typeDechet) {
      params = params.set('typeDechet', typeDechet);
    }
    if (sousType) {
      params = params.set('sousType', sousType);
    }

    return this.http.get<StockDisponible[]>(`${this.venteApiUrl}/stocks`, { params });
  }
}

