import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanningEnlevement, CreatePlanningManuelRequest } from '../models/planning.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer le Planning
 */
@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = `${environment.apiUrl}/admin/planning`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère le planning d'un mois
   */
  getPlanningDuMois(annee: number, mois: number): Observable<PlanningEnlevement[]> {
    return this.http.get<PlanningEnlevement[]>(`${this.apiUrl}/mois/${annee}/${mois}`);
  }

  /**
   * Récupère le planning d'un jour
   */
  getPlanningDuJour(date: string): Observable<PlanningEnlevement[]> {
    return this.http.get<PlanningEnlevement[]>(`${this.apiUrl}/jour/${date}`);
  }

  /**
   * Crée un enlèvement planifié manuel
   */
  createPlanningManuel(request: CreatePlanningManuelRequest): Observable<PlanningEnlevement> {
    const params = new HttpParams()
      .set('datePrevue', request.datePrevue)
      .set('siteId', request.siteId.toString())
      .set('societeId', request.societeId.toString())
      .set('heurePrevue', request.heurePrevue || '')
      .set('commentaire', request.commentaire || '');

    return this.http.post<PlanningEnlevement>(this.apiUrl, null, { params });
  }

  /**
   * Modifie un enlèvement planifié
   */
  modifierPlanning(id: number, datePrevue: string, heurePrevue?: string): Observable<PlanningEnlevement> {
    const params = new HttpParams()
      .set('datePrevue', datePrevue)
      .set('heurePrevue', heurePrevue || '');

    return this.http.put<PlanningEnlevement>(`${this.apiUrl}/${id}`, null, { params });
  }

  /**
   * Annule un enlèvement planifié
   */
  annulerPlanning(id: number): Observable<PlanningEnlevement> {
    return this.http.put<PlanningEnlevement>(`${this.apiUrl}/${id}/annuler`, {});
  }

  /**
   * Supprime un enlèvement planifié
   */
  supprimerPlanning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

