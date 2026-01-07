package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Casbin pour la gestion des permissions basée sur les politiques
 * Remplace l'approche basée uniquement sur les rôles
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CasbinService {
    
    private final Enforcer enforcer;

    /**
     * Vérifie si l'utilisateur actuel a la permission pour une action sur une ressource
     * @param resource La ressource (ex: 'societes', 'enlevements', 'comptabilite')
     * @param action L'action (ex: 'read', 'write')
     * @return true si l'utilisateur a la permission
     */
    public boolean can(String resource, String action) {
        List<String> userRoles = getCurrentUserRoles();
        
        if (userRoles.isEmpty()) {
            return false;
        }

        // Vérifier si au moins un rôle de l'utilisateur a la permission
        for (String role : userRoles) {
            try {
                boolean allowed = enforcer.enforce(role, resource, action);
                if (allowed) {
                    return true;
                }
            } catch (Exception e) {
                log.error("Erreur lors de la vérification de permission pour rôle {}: {}", role, e.getMessage());
            }
        }

        return false;
    }

    /**
     * Vérifie si l'utilisateur actuel a la permission de lecture sur une ressource
     */
    public boolean canRead(String resource) {
        return can(resource, "read");
    }

    /**
     * Vérifie si l'utilisateur actuel a la permission d'écriture sur une ressource
     */
    public boolean canWrite(String resource) {
        return can(resource, "write");
    }

    /**
     * Vérifie si l'utilisateur actuel a un rôle spécifique
     */
    public boolean hasRole(String role) {
        List<String> userRoles = getCurrentUserRoles();
        return userRoles.contains(role);
    }

    /**
     * Vérifie si l'utilisateur actuel est admin
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Vérifie si l'utilisateur actuel est comptable
     */
    public boolean isComptable() {
        return hasRole("COMPTABLE");
    }

    /**
     * Vérifie si l'utilisateur actuel est client
     */
    public boolean isClient() {
        return hasRole("CLIENT");
    }

    /**
     * Récupère tous les rôles de l'utilisateur actuel
     */
    public List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            return List.of();
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> {
                    // Enlever le préfixe "ROLE_" si présent
                    if (authority.startsWith("ROLE_")) {
                        return authority.substring(5);
                    }
                    return authority;
                })
                .collect(Collectors.toList());
    }

    /**
     * Vérifie si l'utilisateur actuel a au moins un des rôles spécifiés
     */
    public boolean hasAnyRole(List<String> roles) {
        List<String> userRoles = getCurrentUserRoles();
        return roles.stream().anyMatch(userRoles::contains);
    }

    /**
     * Vérifie si l'utilisateur actuel a tous les rôles spécifiés
     */
    public boolean hasAllRoles(List<String> roles) {
        List<String> userRoles = getCurrentUserRoles();
        return userRoles.containsAll(roles);
    }
}

