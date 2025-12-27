import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { RoleService } from '../services/role.service';

/**
 * Guard pour vérifier que l'utilisateur a le rôle COMPTABLE
 */
export const comptableGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  if (!roleService.isComptable()) {
    console.log('Accès refusé: rôle COMPTABLE requis');
    router.navigate(['/']);
    return false;
  }

  return true;
};

