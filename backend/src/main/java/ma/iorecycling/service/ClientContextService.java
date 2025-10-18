package ma.iorecycling.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Service pour extraire le contexte client depuis le JWT
 */
@Service
@Slf4j
public class ClientContextService {
    
    /**
     * Extrait le clientId depuis un JWT donné
     */
    public Long getClientId(Jwt jwt) {
        try {
            if (jwt == null) {
                log.warn("JWT null fourni");
                return null;
            }
            
            Object clientIdClaim = jwt.getClaim("clientId");
            
            if (clientIdClaim == null) {
                log.warn("Claim 'clientId' manquant dans le JWT");
                return null;
            }
            
            // Gérer différents types de clientId
            Long clientId;
            if (clientIdClaim instanceof Integer) {
                clientId = ((Integer) clientIdClaim).longValue();
            } else if (clientIdClaim instanceof Long) {
                clientId = (Long) clientIdClaim;
            } else if (clientIdClaim instanceof String) {
                clientId = Long.parseLong((String) clientIdClaim);
            } else {
                log.warn("Type de clientId non supporté: {}", clientIdClaim.getClass());
                return null;
            }
            
            log.debug("ClientId extrait: {}", clientId);
            return clientId;
            
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du clientId: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Extrait le clientId depuis le JWT du contexte de sécurité actuel
     */
    public Long getCurrentClientId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
                log.warn("Aucun JWT trouvé dans le contexte de sécurité");
                return null;
            }
            
            Jwt jwt = (Jwt) authentication.getPrincipal();
            Object clientIdClaim = jwt.getClaim("clientId");
            
            if (clientIdClaim == null) {
                log.warn("Claim 'clientId' manquant dans le JWT");
                return null;
            }
            
            // Gérer différents types de clientId
            Long clientId;
            if (clientIdClaim instanceof Integer) {
                clientId = ((Integer) clientIdClaim).longValue();
            } else if (clientIdClaim instanceof Long) {
                clientId = (Long) clientIdClaim;
            } else if (clientIdClaim instanceof String) {
                clientId = Long.parseLong((String) clientIdClaim);
            } else {
                log.warn("Type de clientId non supporté: {}", clientIdClaim.getClass());
                return null;
            }
            
            log.debug("ClientId extrait: {}", clientId);
            return clientId;
            
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du clientId: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Vérifie si l'utilisateur actuel est un admin
     */
    public boolean isAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return false;
            }
            
            return authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
                    
        } catch (Exception e) {
            log.error("Erreur lors de la vérification du rôle admin: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extrait le nom d'utilisateur depuis le JWT
     */
    public String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
                return null;
            }
            
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("preferred_username");
            
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du nom d'utilisateur: {}", e.getMessage());
            return null;
        }
    }
}