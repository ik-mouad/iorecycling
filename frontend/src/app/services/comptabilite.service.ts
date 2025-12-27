import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Paiement,
  CreatePaiementRequest,
  Echeance,
  ComptabiliteDashboard,
  TypeTransaction
} from '../models/comptabilite.model';
import { Page } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer la comptabilité
 * Consomme les APIs du backend AdminComptabiliteController et ClientComptabiliteController
 */
@Injectable({
  providedIn: 'root'
})
export class ComptabiliteService {
  private comptabiliteApiUrl = `${environment.apiUrl}/comptabilite`;

  constructor(private http: HttpClient) {}

  // ========== TRANSACTIONS (Admin) ==========

  /**
   * Crée une nouvelle transaction (admin)
   */
  createTransaction(request: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.comptabiliteApiUrl}/transactions`, request);
  }

  /**
   * Récupère une transaction par ID (admin)
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.comptabiliteApiUrl}/transactions/${id}`);
  }

  /**
   * Liste les transactions (admin)
   */
  getTransactions(
    societeId: number,
    type?: TypeTransaction,
    page: number = 0,
    size: number = 20
  ): Observable<Page<Transaction>> {
    let params = new HttpParams()
      .set('societeId', societeId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<Page<Transaction>>(`${this.comptabiliteApiUrl}/transactions`, { params });
  }

  /**
   * Liste les transactions impayées (admin)
   */
  getTransactionsImpayees(societeId: number): Observable<Transaction[]> {
    const params = new HttpParams().set('societeId', societeId.toString());
    return this.http.get<Transaction[]>(`${this.comptabiliteApiUrl}/transactions/impayees`, { params });
  }

  /**
   * Met à jour une transaction
   */
  updateTransaction(id: number, request: UpdateTransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.comptabiliteApiUrl}/transactions/${id}`, request);
  }

  /**
   * Supprime une transaction
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.comptabiliteApiUrl}/transactions/${id}`);
  }

  // ========== PAIEMENTS (Admin) ==========

  /**
   * Crée un nouveau paiement (admin)
   */
  createPaiement(request: CreatePaiementRequest): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.comptabiliteApiUrl}/paiements`, request);
  }

  /**
   * Liste les paiements d'une société
   */
  getPaiements(societeId: number, page: number = 0, size: number = 20): Observable<Page<Paiement>> {
    const params = new HttpParams()
      .set('societeId', societeId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Paiement>>(`${this.comptabiliteApiUrl}/paiements`, { params });
  }

  /**
   * Supprime un paiement
   */
  deletePaiement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.comptabiliteApiUrl}/paiements/${id}`);
  }

  // ========== ÉCHÉANCES (Admin) ==========

  /**
   * Liste les échéances en retard (admin)
   */
  getEcheancesEnRetard(societeId: number): Observable<Echeance[]> {
    const params = new HttpParams().set('societeId', societeId.toString());
    return this.http.get<Echeance[]>(`${this.comptabiliteApiUrl}/echeances/retard`, { params });
  }

  /**
   * Liste les échéances à venir
   */
  getEcheancesAVenir(societeId: number, dateDebut: string, dateFin: string): Observable<Echeance[]> {
    const params = new HttpParams()
      .set('societeId', societeId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<Echeance[]>(`${this.comptabiliteApiUrl}/echeances/avenir`, { params });
  }

  /**
   * Marque une échéance comme payée
   */
  marquerEcheancePayee(id: number): Observable<Echeance> {
    return this.http.put<Echeance>(`${this.comptabiliteApiUrl}/echeances/${id}/payer`, {});
  }

  // ========== DASHBOARD ==========

  /**
   * Récupère le dashboard de comptabilité
   */
  getDashboard(
    societeId: number,
    dateDebut: string,
    dateFin: string,
    periode: 'mensuel' | 'trimestriel' | 'annuel' = 'mensuel'
  ): Observable<ComptabiliteDashboard> {
    const params = new HttpParams()
      .set('societeId', societeId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('periode', periode);

    return this.http.get<ComptabiliteDashboard>(`${this.comptabiliteApiUrl}/dashboard`, { params });
  }
}

