import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { authConfig } from './auth.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    // Délayer la configuration pour éviter les erreurs d'injection
    setTimeout(() => {
      this.configure();
    }, 100);
  }

  private configure(): void {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());
    }).catch((error) => {
      console.error('Erreur de configuration OAuth:', error);
      // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      this.isAuthenticatedSubject.next(false);
    });
  }

  login(): void {
    try {
      this.oauthService.initCodeFlow();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert('Erreur de connexion. Vérifiez que Keycloak est accessible.');
    }
  }

  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  getClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  hasRole(role: string): boolean {
    const claims = this.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return false;
    }
    return claims.realm_access.roles.includes(role);
  }

  getClientId(): number | null {
    const claims = this.getClaims();
    return claims?.clientId || null;
  }

  getUserName(): string {
    const claims = this.getClaims();
    return claims?.preferred_username || claims?.name || 'Utilisateur';
  }
}
