package ma.iorecycling.controller;

import ma.iorecycling.dto.DashboardDto;
import ma.iorecycling.repository.PickupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client")
public class ClientController {
    
    @Autowired
    private PickupRepository pickupRepository;
    
    @GetMapping("/dashboard")
    public DashboardDto getDashboard(@AuthenticationPrincipal Jwt jwt) {
        Long clientId = extractClientId(jwt);
        
        // Calculer les statistiques
        Long pickupsCount = pickupRepository.countByClientId(clientId);
        Double kgValorisables = pickupRepository.sumKgValorisablesByClientId(clientId);
        Double kgBanals = pickupRepository.sumKgBanalsByClientId(clientId);
        Double kgDangereux = pickupRepository.sumKgDangereuxByClientId(clientId);
        
        // Créer le DTO de réponse
        DashboardDto.KgSummary kgSummary = new DashboardDto.KgSummary(
            kgValorisables != null ? kgValorisables : 0.0,
            kgBanals != null ? kgBanals : 0.0,
            kgDangereux != null ? kgDangereux : 0.0
        );
        
        return new DashboardDto(pickupsCount, kgSummary);
    }

    private Long extractClientId(Jwt jwt) {
        Object claimValue = jwt.getClaims().get("clientId");
        if (claimValue == null) {
            throw new IllegalArgumentException("clientId non trouvé dans le token JWT");
        }
        if (claimValue instanceof Number) {
            return ((Number) claimValue).longValue();
        }
        if (claimValue instanceof String) {
            try {
                return Long.parseLong((String) claimValue);
            } catch (NumberFormatException ex) {
                // fall through to error below
            }
        }
        throw new IllegalArgumentException("clientId invalide dans le token JWT");
    }
}
