import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Site } from '../models/societe.model';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

/**
 * Service Angular pour gérer les Sites
 */
@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private adminApiUrl = `${environment.apiUrl}/admin`;
  private clientApiUrl = `${environment.apiUrl}/client`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupère tous les sites d'une société
   * Utilise l'endpoint admin si l'utilisateur est admin, sinon l'endpoint client
   */
  getSitesBySociete(societeId: number): Observable<Site[]> {
    // Si l'utilisateur est admin, utiliser l'endpoint admin
    if (this.authService.hasRole('ADMIN')) {
      return this.http.get<Site[]>(`${this.adminApiUrl}/societes/${societeId}/sites`);
    }
    // Sinon, utiliser l'endpoint client (qui récupère automatiquement les sites de la société du client)
    return this.http.get<Site[]>(`${this.clientApiUrl}/sites`);
  }

  /**
   * Récupère un site par son ID
   */
  getSiteById(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.adminApiUrl}/sites/${id}`);
  }

  /**
   * Crée un nouveau site pour une société
   */
  createSite(societeId: number, site: Partial<Site>): Observable<Site> {
    const requestBody = {
      name: site.name,
      adresse: site.adresse
    };
    return this.http.post<Site>(`${this.adminApiUrl}/societes/${societeId}/sites`, requestBody);
  }

  /**
   * Met à jour un site
   */
  updateSite(id: number, site: Partial<Site>): Observable<Site> {
    return this.http.put<Site>(`${this.adminApiUrl}/sites/${id}`, site);
  }

  /**
   * Supprime un site
   */
  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/sites/${id}`);
  }
}

