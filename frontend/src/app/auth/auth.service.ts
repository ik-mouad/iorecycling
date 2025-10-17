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
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    // Vérifier si on a des paramètres d'authentification dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const sessionState = urlParams.get('session_state');
    
    if (code) {
      console.log('Code d\'autorisation détecté dans l\'URL:', code);
      console.log('Session state:', sessionState);
      
      // Simuler une authentification réussie
      this.isAuthenticatedSubject.next(true);
      
      // Nettoyer l'URL des paramètres d'authentification
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Rediriger vers la page simple
      console.log('Redirection vers la page simple...');
      setTimeout(() => {
        window.location.href = '/simple';
      }, 1000);
    } else {
      console.log('Aucun code d\'autorisation trouvé');
      this.isAuthenticatedSubject.next(false);
    }
  }

  login(): void {
    console.log('Tentative de connexion...');
    // Redirection directe vers Keycloak
    const authUrl = 'http://146.59.234.174:88/auth/realms/iorecycling/protocol/openid-connect/auth?' +
      'client_id=frontend&' +
      'redirect_uri=' + encodeURIComponent(window.location.origin + '/') + '&' +
      'response_type=code&' +
      'scope=openid%20profile%20email';
    
    window.location.href = authUrl;
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
    return { 
      preferred_username: 'Test User',
      name: 'Utilisateur Test',
      realm_access: {
        roles: ['CLIENT']
      }
    };
  }

  hasRole(role: string): boolean {
    const claims = this.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return false;
    }
    return claims.realm_access.roles.includes(role);
  }

  getClientId(): number | null {
    return 1; // Temporaire pour les tests
  }

  getUserName(): string {
    const claims = this.getClaims();
    return claims?.preferred_username || claims?.name || 'Utilisateur';
  }
}
