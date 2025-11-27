import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

const buildRoleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && authService.hasRole(requiredRole)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};

export const adminGuard: CanActivateFn = buildRoleGuard('ADMIN');
export const clientGuard: CanActivateFn = buildRoleGuard('CLIENT');
