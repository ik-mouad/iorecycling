import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
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
      
      // Échanger le code contre un token
      this.exchangeCodeForToken(code);
    } else {
      // Vérifier si on a déjà un token valide
      const token = localStorage.getItem('keycloak_token');
      if (token && !this.isTokenExpired(token)) {
        this.isAuthenticatedSubject.next(true);
        this.navigatePostLogin();
      } else {
        this.isAuthenticatedSubject.next(false);
      }
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
    // Supprimer le token
    localStorage.removeItem('keycloak_token');
    sessionStorage.removeItem('keycloak_token');
    
    this.isAuthenticatedSubject.next(false);
    console.log('Déconnexion');
    
    // Rediriger vers Keycloak pour la déconnexion
    const logoutUrl = 'http://146.59.234.174:88/auth/realms/iorecycling/protocol/openid-connect/logout?' +
      'redirect_uri=' + encodeURIComponent(window.location.origin + '/');
    
    window.location.href = logoutUrl;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getAccessToken(): string {
    return 'dummy-token';
  }

  getClaims(): any {
    // Essayer de récupérer les claims depuis le localStorage ou sessionStorage
    const token = localStorage.getItem('keycloak_token') || sessionStorage.getItem('keycloak_token');
    
    if (token) {
      try {
        // Décoder le JWT (partie payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    }
    
    // Fallback pour les tests
    return { 
      preferred_username: 'client1',
      given_name: 'Mouad',
      family_name: 'Idrissi Khamlichi',
      name: 'Mouad Idrissi Khamlichi',
      email: 'client1@iorecycling.ma',
      realm_access: {
        roles: ['CLIENT']
      },
      clientId: 1
    };
  }

  hasRole(role: string): boolean {
    const claims = this.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return false;
    }
    return claims.realm_access.roles.includes(role);
  }

  getUserRoles(): string[] {
    const claims = this.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return [];
    }
    return claims.realm_access.roles;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('keycloak_token') || sessionStorage.getItem('keycloak_token');
    if (token && !this.isTokenExpired(token)) {
      return true;
    }
    return this.isAuthenticatedSubject.value;
  }

  getClientId(): number | null {
    return 1; // Temporaire pour les tests
  }

  getUserName(): string {
    const claims = this.getClaims();
    return claims?.name || `${claims?.given_name || ''} ${claims?.family_name || ''}`.trim() || claims?.preferred_username || 'Utilisateur';
  }

  /**
   * Échange le code d'autorisation contre un token
   */
  private exchangeCodeForToken(code: string): void {
    const tokenUrl = 'http://146.59.234.174:88/auth/realms/iorecycling/protocol/openid-connect/token';
    
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', 'frontend');
    body.append('code', code);
    body.append('redirect_uri', window.location.origin + '/');
    
    fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      if (data.access_token) {
        localStorage.setItem('keycloak_token', data.access_token);
        this.isAuthenticatedSubject.next(true);
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('Token récupéré avec succès');
        this.navigatePostLogin();
      } else {
        console.error('Erreur lors de la récupération du token:', data);
        this.isAuthenticatedSubject.next(false);
      }
    })
    .catch(error => {
      console.error('Erreur lors de l\'échange du code:', error);
      this.isAuthenticatedSubject.next(false);
    });
  }

  /**
   * Vérifie si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Redirige l'utilisateur après authentification selon ses rôles
   */
  private navigatePostLogin(): void {
    const currentPath = window.location.pathname || '';
    const alreadyOnTarget = currentPath.startsWith('/admin') || currentPath.startsWith('/client');
    if (alreadyOnTarget) {
      return;
    }
    const claims = this.getClaims();
    const roles: string[] = claims?.realm_access?.roles || [];
    if (roles.includes('ADMIN')) {
      this.router.navigateByUrl('/admin');
    } else {
      this.router.navigateByUrl('/client');
    }
  }
}
