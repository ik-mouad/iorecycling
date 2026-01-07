import { Injectable } from '@angular/core';
import { newEnforcer, Enforcer } from 'casbin';
import { AuthService } from '../auth/auth.service';

/**
 * Version synchrone du service Casbin pour une utilisation plus simple dans les templates
 * Utilise un cache pour éviter les appels asynchrones répétés
 */
@Injectable({
  providedIn: 'root'
})
export class CasbinSyncService {
  private enforcer: Enforcer | null = null;
  private initialized = false;
  private permissionCache: Map<string, boolean> = new Map();
  private cacheTimeout = 5000; // 5 secondes
  private lastCacheUpdate = 0;

  constructor(private authService: AuthService) {
    this.initializeEnforcer();
  }

  /**
   * Initialise l'enforcer Casbin avec le modèle et les politiques
   */
  private async initializeEnforcer(): Promise<void> {
    try {
      // Modèle RBAC (Role-Based Access Control)
      const model = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;

      // Politiques basées sur les rôles
      const policies = `
p, ADMIN, societes, read
p, ADMIN, societes, write
p, ADMIN, enlevements, read
p, ADMIN, enlevements, write
p, ADMIN, demandes, read
p, ADMIN, demandes, write
p, ADMIN, planning, read
p, ADMIN, planning, write
p, ADMIN, recurrences, read
p, ADMIN, recurrences, write
p, ADMIN, camions, read
p, ADMIN, camions, write
p, ADMIN, destinations, read
p, ADMIN, destinations, write
p, ADMIN, swagger, read
p, COMPTABLE, comptabilite, read
p, COMPTABLE, comptabilite, write
p, COMPTABLE, ventes, read
p, COMPTABLE, ventes, write
p, COMPTABLE, stocks, read
p, COMPTABLE, stocks, write
p, COMPTABLE, enlevements, read
p, COMPTABLE, demandes, read
p, CLIENT, demandes, read
p, CLIENT, demandes, write
p, CLIENT, enlevements, read
`;

      this.enforcer = await newEnforcer(model, policies);
      this.initialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Casbin:', error);
      this.initialized = false;
    }
  }

  /**
   * Vérifie si l'utilisateur a la permission (version synchrone avec cache)
   */
  can(resource: string, action: string): boolean {
    // Vérifier le cache
    const cacheKey = `${resource}:${action}`;
    const now = Date.now();
    
    if (now - this.lastCacheUpdate < this.cacheTimeout && this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    if (!this.initialized || !this.enforcer) {
      // Initialisation asynchrone en arrière-plan
      this.initializeEnforcer();
      return false;
    }

    const userRoles = this.authService.getUserRoles();
    if (userRoles.length === 0) {
      this.updateCache(cacheKey, false);
      return false;
    }

    // Vérifier si au moins un rôle de l'utilisateur a la permission
    // Note: Casbin enforce est synchrone dans la version JS
    let allowed = false;
    for (const role of userRoles) {
      try {
        // Dans Casbin JS, enforce est synchrone
        allowed = this.enforcer!.enforce(role, resource, action);
        if (allowed) {
          break;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de permission:', error);
      }
    }

    this.updateCache(cacheKey, allowed);
    return allowed;
  }

  /**
   * Met à jour le cache des permissions
   */
  private updateCache(key: string, value: boolean): void {
    this.permissionCache.set(key, value);
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Vérifie si l'utilisateur a la permission de lecture
   */
  canRead(resource: string): boolean {
    return this.can(resource, 'read');
  }

  /**
   * Vérifie si l'utilisateur a la permission d'écriture
   */
  canWrite(resource: string): boolean {
    return this.can(resource, 'write');
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  /**
   * Vérifie si l'utilisateur est comptable
   */
  isComptable(): boolean {
    return this.authService.hasRole('COMPTABLE');
  }

  /**
   * Vérifie si l'utilisateur est client
   */
  isClient(): boolean {
    return this.authService.hasRole('CLIENT');
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Récupère tous les rôles de l'utilisateur
   */
  getUserRoles(): string[] {
    return this.authService.getUserRoles();
  }
}

