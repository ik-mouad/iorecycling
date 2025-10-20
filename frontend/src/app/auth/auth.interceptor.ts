import { HttpInterceptorFn } from '@angular/common/http';

// Intercepteur minimaliste: ajoute le Bearer token stocké par AuthService
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('keycloak_token') : null;
  if (token) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    );
  }
  return next(req);
};
