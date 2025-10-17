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
    this.configure();
  }

  private configure(): void {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());
    });
  }

  login(): void {
    this.oauthService.initCodeFlow();
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
