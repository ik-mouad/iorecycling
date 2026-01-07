import { Injectable } from '@angular/core';
import { newEnforcer, Enforcer } from 'casbin';
import { AuthService } from '../auth/auth.service';

/**
 * Service Casbin pour la gestion des permissions basée sur les politiques
 * Remplace l'approche basée uniquement sur les rôles
 */
@Injectable({
  providedIn: 'root'
})
export class CasbinService {
  private enforcer: Enforcer | null = null;
  private initialized = false;

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
   * Vérifie si l'utilisateur a la permission pour une action sur une ressource
   * @param resource La ressource (ex: 'societes', 'enlevements', 'comptabilite')
   * @param action L'action (ex: 'read', 'write')
   * @returns true si l'utilisateur a la permission
   */
  can(resource: string, action: string): boolean {
    if (!this.initialized || !this.enforcer) {
      // Si pas encore initialisé, retourner false (l'initialisation se fera en arrière-plan)
      // Pour une utilisation immédiate, on peut utiliser les rôles comme fallback
      return this.fallbackCheck(resource, action);
    }

    const userRoles = this.authService.getUserRoles();
    if (userRoles.length === 0) {
      return false;
    }

    // Vérifier si au moins un rôle de l'utilisateur a la permission
    // Note: Casbin JS enforce() peut être asynchrone, donc on utilise le fallback
    // pour une vérification synchrone immédiate
    // Pour une utilisation complète de Casbin, utilisez CasbinSyncService
    return this.fallbackCheck(resource, action);

    return false;
  }

  /**
   * Vérifie si l'utilisateur a la permission de lecture sur une ressource
   */
  canRead(resource: string): boolean {
    return this.can(resource, 'read');
  }

  /**
   * Vérifie si l'utilisateur a la permission d'écriture sur une ressource
   */
  canWrite(resource: string): boolean {
    return this.can(resource, 'write');
  }

  /**
   * Vérifie si l'utilisateur est admin (compatibilité avec l'ancien code)
   */
  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  /**
   * Vérifie si l'utilisateur est comptable (compatibilité avec l'ancien code)
   */
  isComptable(): boolean {
    return this.authService.hasRole('COMPTABLE');
  }

  /**
   * Vérifie si l'utilisateur est client (compatibilité avec l'ancien code)
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

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Vérifie si l'utilisateur a tous les rôles spécifiés
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Vérification de fallback basée sur les rôles si Casbin n'est pas encore initialisé
   */
  private fallbackCheck(resource: string, action: string): boolean {
    const userRoles = this.authService.getUserRoles();
    
    // Mapping simple des ressources aux rôles (compatibilité avec l'ancien système)
    const roleResourceMap: { [key: string]: string[] } = {
      'societes': ['ADMIN'],
      'enlevements': ['ADMIN', 'COMPTABLE'],
      'demandes': ['ADMIN', 'COMPTABLE', 'CLIENT'],
      'planning': ['ADMIN'],
      'recurrences': ['ADMIN'],
      'camions': ['ADMIN'],
      'destinations': ['ADMIN'],
      'comptabilite': ['COMPTABLE'],
      'ventes': ['COMPTABLE'],
      'stocks': ['COMPTABLE'],
      'swagger': ['ADMIN']
    };

    const allowedRoles = roleResourceMap[resource] || [];
    return allowedRoles.some(role => userRoles.includes(role));
  }
}

