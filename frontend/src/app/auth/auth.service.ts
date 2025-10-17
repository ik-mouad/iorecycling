import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    console.log('AuthService initialisé');
    this.checkAuthCallback();
  }

  private checkAuthCallback(): void {
    // Vérifier si on revient de Keycloak avec un code d'autorisation
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      console.log('Code d\'autorisation reçu:', code);
      // Simuler une connexion réussie
      this.isAuthenticatedSubject.next(true);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Rediriger vers le dashboard client
      window.location.href = '/client';
    }
  }

  login(): void {
    console.log('Tentative de connexion...');
    // Redirection vers Keycloak
    window.location.href = 'http://146.59.234.174:88/auth/realms/iorecycling/protocol/openid-connect/auth?client_id=frontend&redirect_uri=' + encodeURIComponent(window.location.origin + '/') + '&response_type=code&scope=openid%20profile%20email';
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    console.log('Déconnexion');
    // Rediriger vers la page de login
    window.location.href = '/';
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getAccessToken(): string {
    return 'dummy-token';
  }

  getClaims(): any {
    return { preferred_username: 'Test User' };
  }

  hasRole(role: string): boolean {
    return true; // Temporaire pour les tests
  }

  getClientId(): number | null {
    return 1; // Temporaire pour les tests
  }

  getUserName(): string {
    return 'Utilisateur Test';
  }
}
