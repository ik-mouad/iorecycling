import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { CasbinService } from '../services/casbin.service';

/**
 * Guard pour vérifier que l'utilisateur a la permission comptable (basé sur Casbin)
 */
export const comptableGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const casbinService = inject(CasbinService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  // Vérifier la permission avec Casbin
  if (!casbinService.canRead('comptabilite') && !casbinService.isComptable()) {
    console.log('Accès refusé: permission comptable requise');
    router.navigate(['/']);
    return false;
  }

  return true;
};

