package ma.iorecycling.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ClientContextService {
    
    /**
     * Extrait le clientId depuis le token JWT
     */
    public Long extractClientId(Jwt jwt) {
        Object claimValue = jwt.getClaims().get("clientId");
        if (claimValue == null) {
            log.error("clientId non trouvé dans le token JWT");
            throw new IllegalArgumentException("clientId non trouvé dans le token JWT");
        }
        
        if (claimValue instanceof Number) {
            return ((Number) claimValue).longValue();
        }
        
        if (claimValue instanceof String) {
            try {
                return Long.parseLong((String) claimValue);
            } catch (NumberFormatException ex) {
                log.error("clientId invalide dans le token JWT: {}", claimValue);
                throw new IllegalArgumentException("clientId invalide dans le token JWT: " + claimValue);
            }
        }
        
        log.error("Type de clientId non supporté: {}", claimValue.getClass().getSimpleName());
        throw new IllegalArgumentException("Type de clientId non supporté: " + claimValue.getClass().getSimpleName());
    }
    
    /**
     * Extrait le clientId depuis le token JWT avec annotation
     */
    public Long getClientId(@AuthenticationPrincipal Jwt jwt) {
        return extractClientId(jwt);
    }
}
