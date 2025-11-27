import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandeEnlevement, CreateDemandeRequest } from '../models/demande.model';
import { Page } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Demandes d'Enlèvements
 */
@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle demande (client)
   */
  createDemande(request: CreateDemandeRequest): Observable<DemandeEnlevement> {
    return this.http.post<DemandeEnlevement>(`${this.apiUrl}/client/demandes`, request);
  }

  /**
   * Liste mes demandes (client)
   */
  getMesDemandes(page: number = 0, size: number = 20): Observable<Page<DemandeEnlevement>> {
    return this.http.get<Page<DemandeEnlevement>>(
      `${this.apiUrl}/client/demandes?page=${page}&size=${size}`
    );
  }

  /**
   * Annule une demande (client)
   */
  annulerDemande(id: number): Observable<DemandeEnlevement> {
    return this.http.put<DemandeEnlevement>(`${this.apiUrl}/client/demandes/${id}/annuler`, {});
  }

  /**
   * Liste les demandes en attente (admin)
   */
  getDemandesEnAttente(): Observable<DemandeEnlevement[]> {
    return this.http.get<DemandeEnlevement[]>(`${this.apiUrl}/admin/demandes/en-attente`);
  }

  /**
   * Valide une demande (admin)
   */
  validerDemande(id: number): Observable<DemandeEnlevement> {
    return this.http.put<DemandeEnlevement>(`${this.apiUrl}/admin/demandes/${id}/valider`, {});
  }

  /**
   * Refuse une demande (admin)
   */
  refuserDemande(id: number, motif: string): Observable<DemandeEnlevement> {
    return this.http.put<DemandeEnlevement>(
      `${this.apiUrl}/admin/demandes/${id}/refuser?motifRefus=${encodeURIComponent(motif)}`,
      {}
    );
  }
}

