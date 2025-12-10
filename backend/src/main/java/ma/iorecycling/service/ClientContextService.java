package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.entity.ClientUser;
import ma.iorecycling.repository.ClientUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service pour extraire le contexte client depuis le JWT
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ClientContextService {
    
    private final ClientUserRepository clientUserRepository;
    
    /**
     * Extrait l'ID de la société depuis un JWT donné
     * Cherche d'abord le claim clientId, sinon utilise l'email pour trouver le ClientUser
     */
    public Long getClientId(Jwt jwt) {
        try {
            if (jwt == null) {
                log.warn("JWT null fourni");
                return null;
            }
            
            // Essayer d'abord le claim clientId (si présent)
            Object clientIdClaim = jwt.getClaim("clientId");
            if (clientIdClaim != null) {
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
                log.debug("ClientId extrait depuis claim: {}", clientId);
                return clientId;
            }
            
            // Sinon, extraire l'email ou le username du JWT
            String email = jwt.getClaimAsString("email");
            if (email == null || email.isEmpty()) {
                email = jwt.getClaimAsString("preferred_username");
            }
            
            if (email == null || email.isEmpty()) {
                log.warn("Email et preferred_username manquants dans le JWT");
                return null;
            }
            
            // Chercher le ClientUser par email
            Optional<ClientUser> clientUserOpt = clientUserRepository.findByEmail(email);
            if (clientUserOpt.isEmpty()) {
                log.warn("Aucun ClientUser trouvé pour l'email: {}", email);
                return null;
            }
            
            ClientUser clientUser = clientUserOpt.get();
            if (!clientUser.getActive()) {
                log.warn("ClientUser inactif pour l'email: {}", email);
                return null;
            }
            
            Long societeId = clientUser.getSociete() != null ? clientUser.getSociete().getId() : null;
            log.debug("Société ID extraite pour email {}: {}", email, societeId);
            return societeId;
            
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du clientId: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Extrait l'ID de la société depuis le JWT du contexte de sécurité actuel
     */
    public Long getCurrentClientId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
                log.warn("Aucun JWT trouvé dans le contexte de sécurité");
                return null;
            }
            
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return getClientId(jwt);
            
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction du clientId: {}", e.getMessage(), e);
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