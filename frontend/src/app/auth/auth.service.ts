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
    console.log('AuthService initialisé');
    this.configure();
  }

  private configure(): void {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      const isAuthenticated = this.oauthService.hasValidAccessToken();
      this.isAuthenticatedSubject.next(isAuthenticated);
      console.log('Authentification:', isAuthenticated);
    }).catch((error) => {
      console.error('Erreur de configuration OAuth:', error);
      this.isAuthenticatedSubject.next(false);
    });
  }

  login(): void {
    console.log('Tentative de connexion...');
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
    console.log('Déconnexion');
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
