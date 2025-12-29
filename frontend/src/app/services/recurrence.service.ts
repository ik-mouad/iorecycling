import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recurrence, CreateRecurrenceRequest } from '../models/planning.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Récurrences
 */
@Injectable({
  providedIn: 'root'
})
export class RecurrenceService {
  private apiUrl = `${environment.apiUrl}/admin/recurrences`;

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle récurrence
   */
  createRecurrence(request: CreateRecurrenceRequest): Observable<Recurrence> {
    return this.http.post<Recurrence>(this.apiUrl, request);
  }

  /**
   * Liste toutes les récurrences actives
   */
  getRecurrencesActives(): Observable<Recurrence[]> {
    return this.http.get<Recurrence[]>(this.apiUrl);
  }

  /**
   * Liste les récurrences d'une société
   */
  getRecurrencesBySociete(societeId: number): Observable<Recurrence[]> {
    return this.http.get<Recurrence[]>(`${this.apiUrl}/societe/${societeId}`);
  }

  /**
   * Désactive une récurrence
   */
  desactiverRecurrence(id: number): Observable<Recurrence> {
    return this.http.put<Recurrence>(`${this.apiUrl}/${id}/desactiver`, {});
  }

  /**
   * Supprime une récurrence
   * @param id ID de la récurrence à supprimer
   * @param supprimerToutesOccurrences Si true, supprime toutes les occurrences (passées et futures), 
   *                                   si false, supprime uniquement les occurrences futures
   */
  supprimerRecurrence(id: number, supprimerToutesOccurrences: boolean = false): Observable<void> {
    const params = new HttpParams().set('supprimerToutesOccurrences', supprimerToutesOccurrences.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}

