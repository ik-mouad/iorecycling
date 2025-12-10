import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardKpis } from '../models/dashboard.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour le Dashboard Client
 * Consomme les APIs du backend ClientDashboardKpisController
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/client/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les KPIs pour une période
   */
  getKpis(dateDebut?: string, dateFin?: string): Observable<DashboardKpis> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<DashboardKpis>(`${this.apiUrl}/kpis`, { params });
  }

  /**
   * Récupère le nombre d'enlèvements pour une période
   */
  getEnlevementsCount(dateDebut?: string, dateFin?: string): Observable<number> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<number>(`${this.apiUrl}/count`, { params });
  }

  /**
   * Calcule les dates pour les périodes prédéfinies
   */
  getPeriodeDates(periode: string): { dateDebut: string | null; dateFin: string | null } {
    const today = new Date();
    let dateDebut: Date | null = null;
    let dateFin: Date = today;

    switch (periode) {
      case 'mois-en-cours':
        dateDebut = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'mois-precedent':
        dateDebut = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        dateFin = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case '3-mois':
        dateDebut = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case '6-mois':
        dateDebut = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        break;
      case 'annee-en-cours':
        dateDebut = new Date(today.getFullYear(), 0, 1);
        break;
      case 'depuis-debut':
        return { dateDebut: null, dateFin: null };
      default:
        dateDebut = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      dateDebut: dateDebut ? this.formatDate(dateDebut) : null,
      dateFin: this.formatDate(dateFin)
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }
}
