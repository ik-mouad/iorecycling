import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Génère un UUID v4 simple (sans dépendance externe)
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour navigateurs plus anciens
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Intercepteur pour la propagation des traces distribuées
 * - Génère un x-request-id UUID si absent
 * - Propage le header traceparent (W3C Trace Context) depuis les réponses
 * - Ajoute x-request-id à toutes les requêtes HTTP
 */
export const traceInterceptor: HttpInterceptorFn = (req, next) => {
  // Générer un x-request-id si absent
  let requestId = req.headers.get('x-request-id');
  if (!requestId) {
    requestId = generateUUID();
  }

  // Récupérer traceparent depuis le localStorage (si présent depuis une réponse précédente)
  // ou depuis les headers de la requête
  let traceparent = req.headers.get('traceparent');
  if (!traceparent && typeof localStorage !== 'undefined') {
    traceparent = localStorage.getItem('traceparent');
  }

  // Cloner la requête avec les nouveaux headers
  const headers: { [key: string]: string } = {};
  
  // Copier les headers existants
  req.headers.keys().forEach(key => {
    const value = req.headers.get(key);
    if (value) {
      headers[key] = value;
    }
  });

  // Ajouter x-request-id
  headers['x-request-id'] = requestId;

  // Ajouter traceparent si disponible
  if (traceparent) {
    headers['traceparent'] = traceparent;
  }

  const clonedReq = req.clone({
    setHeaders: headers
  });

  return next(clonedReq).pipe(
    // Intercepter la réponse pour extraire traceparent et le stocker
    tap(response => {
      if (response instanceof HttpResponse) {
        const traceparentHeader = response.headers.get('traceparent');
        if (traceparentHeader && typeof localStorage !== 'undefined') {
          localStorage.setItem('traceparent', traceparentHeader);
        }
      }
    })
  );
};

