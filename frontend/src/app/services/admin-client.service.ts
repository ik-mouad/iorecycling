import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  id: number;
  name: string;
  code: string;
  sites: Site[];
  createdAt: string;
}

export interface Site {
  id: number;
  name: string;
  address?: string;
  contactPhone?: string;
  clientId: number;
}

export interface CreateClientRequest {
  name: string;
  code: string;
}

export interface CreateSiteRequest {
  name: string;
  address?: string;
  contactPhone?: string;
  clientId: number;
}

/**
 * Service pour la gestion administrative des clients
 */
@Injectable({
  providedIn: 'root'
})
export class AdminClientService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Liste tous les clients
   */
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  /**
   * Récupère un client par ID
   */
  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  /**
   * Crée un nouveau client
   */
  createClient(client: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  /**
   * Met à jour un client
   */
  updateClient(id: number, client: CreateClientRequest): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, client);
  }

  /**
   * Supprime un client
   */
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }

  /**
   * Crée un nouveau site pour un client
   */
  createSite(site: CreateSiteRequest): Observable<Site> {
    return this.http.post<Site>(`${this.baseUrl}/sites`, site);
  }

  /**
   * Met à jour un site
   */
  updateSite(id: number, site: Partial<CreateSiteRequest>): Observable<Site> {
    return this.http.put<Site>(`${this.baseUrl}/sites/${id}`, site);
  }

  /**
   * Supprime un site
   */
  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sites/${id}`);
  }
}
