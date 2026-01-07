import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CasbinService } from '../services/casbin.service';

/**
 * Guard pour vérifier les rôles utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private casbinService: CasbinService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    
    // Vérifier avec Casbin si l'utilisateur a au moins un des rôles requis
    const hasRequiredRole = requiredRoles.some(role => this.casbinService.hasRole(role));
    
    if (!hasRequiredRole) {
      console.log('Accès refusé: rôles requis:', requiredRoles, 'rôles utilisateur:', this.casbinService.getUserRoles());
      this.router.navigate(['/']);
      return false;
    }
    
    return true;
  }
}
