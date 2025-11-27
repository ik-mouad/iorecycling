import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientUser, CreateClientUserRequest } from '../models/societe.model';
import { environment } from '../../environments/environment';

/**
 * Service Angular pour gérer les Utilisateurs Clients
 */
@Injectable({
  providedIn: 'root'
})
export class ClientUserService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs d'une société
   */
  getUsersBySociete(societeId: number): Observable<ClientUser[]> {
    return this.http.get<ClientUser[]>(`${this.apiUrl}/societes/${societeId}/users`);
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Observable<ClientUser> {
    return this.http.get<ClientUser>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Crée un nouvel utilisateur pour une société
   */
  createUser(societeId: number, user: CreateClientUserRequest): Observable<ClientUser> {
    const payload: CreateClientUserRequest = {
      ...user,
      societeId
    };
    return this.http.post<ClientUser>(`${this.apiUrl}/societes/${societeId}/users`, payload);
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(id: number, user: CreateClientUserRequest): Observable<ClientUser> {
    return this.http.put<ClientUser>(`${this.apiUrl}/users/${id}`, user);
  }

  /**
   * Active ou désactive un utilisateur
   */
  toggleActive(id: number): Observable<ClientUser> {
    return this.http.put<ClientUser>(`${this.apiUrl}/users/${id}/toggle-active`, {});
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}

