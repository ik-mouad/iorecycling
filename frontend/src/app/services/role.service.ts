import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  constructor(private authService: AuthService) {}
  
  hasRole(role: string): boolean {
    const claims = this.authService.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return false;
    }
    return claims.realm_access.roles.includes(role);
  }
  
  getUserRoles(): string[] {
    const claims = this.authService.getClaims();
    if (!claims || !claims.realm_access || !claims.realm_access.roles) {
      return [];
    }
    return claims.realm_access.roles;
  }
  
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
  
  isClient(): boolean {
    return this.hasRole('CLIENT');
  }
  
  isComptable(): boolean {
    return this.hasRole('COMPTABLE');
  }
  
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }
  
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every(role => userRoles.includes(role));
  }
}
