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
        // Extraire le clientId depuis le token JWT
        Object clientIdObj = jwt.getClaim("clientId");
        Long clientId = null;
        
        if (clientIdObj instanceof Number) {
            clientId = ((Number) clientIdObj).longValue();
        } else if (clientIdObj instanceof String) {
            try {
                clientId = Long.parseLong((String) clientIdObj);
            } catch (NumberFormatException e) {
                // Ignore
            }
        }
        
        if (clientId == null) {
            throw new IllegalArgumentException("clientId non trouvé dans le token JWT");
        }
        
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
}
