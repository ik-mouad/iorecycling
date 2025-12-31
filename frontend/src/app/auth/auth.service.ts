import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const sessionState = urlParams.get('session_state');
    
    if (error) {
      console.error('Erreur d\'authentification Keycloak:', error, errorDescription);
      this.isAuthenticatedSubject.next(false);
      // Afficher un message d'erreur
      alert('Erreur d\'authentification: ' + (errorDescription || error));
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (code) {
      console.log('Code d\'autorisation détecté dans l\'URL');
      console.log('Code:', code.substring(0, 20) + '...');
      console.log('Session state:', sessionState);
      console.log('URL complète:', window.location.href);
      
      // Échanger le code contre un token
      this.exchangeCodeForToken(code);
    } else {
      // Vérifier si on a déjà un token valide
      const token = localStorage.getItem('keycloak_token');
      if (token && !this.isTokenExpired(token)) {
        console.log('Token valide trouvé dans le localStorage');
        this.isAuthenticatedSubject.next(true);
        // Si on est sur la page de login, rediriger
        if (window.location.pathname === '/' || window.location.pathname === '/login') {
          this.navigatePostLogin(token);
        }
      } else {
        console.log('Aucun token valide trouvé');
        if (token) {
          console.log('Token expiré, suppression...');
          localStorage.removeItem('keycloak_token');
        }
        this.isAuthenticatedSubject.next(false);
      }
    }
  }

  login(): void {
    console.log('Tentative de connexion...');
    // Redirection directe vers Keycloak
    const base = `${window.location.origin}${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect`;
    const authUrl = `${base}/auth?` +
      `client_id=${environment.keycloak.clientId}&` +
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
    const base = `${window.location.origin}${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect`;
    const logoutUrl = `${base}/logout?redirect_uri=` + encodeURIComponent(window.location.origin + '/');
    
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
    const claims = this.getClaims();
    if (claims?.clientId) {
      return typeof claims.clientId === 'number' ? claims.clientId : parseInt(claims.clientId, 10);
    }
    // Fallback temporaire pour les tests
    return 1;
  }

  getSocieteId(): number | null {
    return this.getClientId(); // clientId est en fait le societeId
  }

  getUserName(): string {
    const claims = this.getClaims();
    return claims?.name || `${claims?.given_name || ''} ${claims?.family_name || ''}`.trim() || claims?.preferred_username || 'Utilisateur';
  }

  /**
   * Échange le code d'autorisation contre un token
   */
  private exchangeCodeForToken(code: string): void {
    const tokenUrl = `${window.location.origin}${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;
    const redirectUri = window.location.origin + '/';
    
    console.log('🔄 Échange du code contre un token...');
    console.log('📍 Token URL:', tokenUrl);
    console.log('📍 Redirect URI:', redirectUri);
    console.log('🔑 Code:', code.substring(0, 20) + '...');
    
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', environment.keycloak.clientId);
    body.append('code', code);
    body.append('redirect_uri', redirectUri);
    
    console.log('📤 Envoi de la requête POST vers:', tokenUrl);
    console.log('📦 Body:', body.toString());
    
    fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
      credentials: 'include' // Important pour les cookies
    })
    .then(response => {
      console.log('📥 Réponse du serveur:', response.status, response.statusText);
      // Log des headers (si disponibles)
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('📥 Headers:', headers);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.error('❌ Erreur HTTP:', response.status, response.statusText);
          console.error('❌ Corps de la réponse:', text);
          
          // Essayer de parser comme JSON pour un message d'erreur plus clair
          let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error_description || errorData.error || errorMessage;
            console.error('❌ Détails de l\'erreur:', errorData);
          } catch (e) {
            // Ce n'est pas du JSON, utiliser le texte brut
            errorMessage = text || errorMessage;
          }
          
          throw new Error(errorMessage);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Données reçues:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type
      });
      
      if (data.access_token) {
        localStorage.setItem('keycloak_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('keycloak_refresh_token', data.refresh_token);
        }
        this.isAuthenticatedSubject.next(true);
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('✅ Token récupéré et stocké avec succès');
        // Passer le token directement pour éviter les problèmes de timing
        this.navigatePostLogin(data.access_token);
      } else {
        console.error('❌ Erreur: pas de access_token dans la réponse:', data);
        this.isAuthenticatedSubject.next(false);
        // Afficher un message d'erreur à l'utilisateur
        const errorMsg = data.error_description || data.error || 'Token non reçu';
        console.error('❌ Message d\'erreur:', errorMsg);
        alert('Erreur d\'authentification: ' + errorMsg);
      }
    })
    .catch(error => {
      console.error('❌ Erreur lors de l\'échange du code:', error);
      console.error('❌ Stack trace:', error.stack);
      this.isAuthenticatedSubject.next(false);
      
      // Message d'erreur plus détaillé
      let errorMessage = error.message || 'Erreur inconnue';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Erreur de connexion réseau. Vérifiez que Keycloak est accessible.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Erreur CORS. Vérifiez la configuration Web Origins dans Keycloak.';
      } else if (error.message.includes('invalid_client') || error.message.includes('unauthorized_client')) {
        errorMessage = 'Erreur de configuration client. Le client "frontend" doit être un client public (Client authentication: OFF).';
      } else if (error.message.includes('invalid_grant') || error.message.includes('invalid_code')) {
        errorMessage = 'Le code d\'autorisation est invalide ou a expiré. Réessayez de vous connecter.';
      }
      
      alert('Erreur de connexion: ' + errorMessage);
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
  private navigatePostLogin(token?: string): void {
    const currentPath = window.location.pathname || '';
    const alreadyOnTarget = currentPath.startsWith('/admin') || 
                            currentPath.startsWith('/client') || 
                            currentPath.startsWith('/comptable');
    if (alreadyOnTarget) {
      return;
    }
    
    // Utiliser le token fourni ou récupérer depuis localStorage
    const tokenToUse = token || localStorage.getItem('keycloak_token');
    let roles: string[] = [];
    
    if (tokenToUse) {
      try {
        // Décoder le JWT (partie payload)
        const payload = JSON.parse(atob(tokenToUse.split('.')[1]));
        roles = payload?.realm_access?.roles || [];
        console.log('Rôles extraits du token:', roles);
      } catch (error) {
        console.error('Erreur lors du décodage du token pour la redirection:', error);
        // Fallback : utiliser getClaims()
        const claims = this.getClaims();
        roles = claims?.realm_access?.roles || [];
      }
    } else {
      // Fallback : utiliser getClaims()
      const claims = this.getClaims();
      roles = claims?.realm_access?.roles || [];
    }
    
    console.log('Redirection selon les rôles:', roles);
    
    // Priorité : COMPTABLE > ADMIN > CLIENT
    if (roles.includes('COMPTABLE')) {
      console.log('Redirection vers /comptable/dashboard');
      this.router.navigateByUrl('/comptable/dashboard');
    } else if (roles.includes('ADMIN')) {
      console.log('Redirection vers /admin/enlevements');
      this.router.navigateByUrl('/admin/enlevements');
    } else {
      console.log('Redirection vers /client');
      this.router.navigateByUrl('/client');
    }
  }
}
