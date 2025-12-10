import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Intercepteur: ajoute le Bearer token et gère les erreurs 401
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Vérifier si le token est expiré avant de l'envoyer
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('keycloak_token') : null;
  
  let authReq = req;
  if (token && !isTokenExpired(token)) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else if (token && isTokenExpired(token)) {
    // Token expiré : supprimer et rediriger vers login
    localStorage.removeItem('keycloak_token');
    router.navigate(['/login']);
    return throwError(() => new Error('Token expiré'));
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token invalide ou expiré : supprimer et rediriger vers login
        localStorage.removeItem('keycloak_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Vérifie si le token JWT est expiré
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}
