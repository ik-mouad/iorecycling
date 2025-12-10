package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.EnlevementDTO;
import ma.iorecycling.service.EnlevementService;
import ma.iorecycling.service.ClientContextService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST pour la consultation des enlèvements (côté client)
 */
@RestController
@RequestMapping("/api/client/enlevements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Enlèvements", description = "API pour consulter les enlèvements de la société")
@PreAuthorize("hasRole('CLIENT')")
public class ClientEnlevementController {
    
    private final EnlevementService enlevementService;
    private final ClientContextService clientContextService;
    
    /**
     * Récupère un enlèvement par son ID (vérifie qu'il appartient à la société du client)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un enlèvement", description = "Récupère les détails d'un enlèvement de la société")
    public ResponseEntity<EnlevementDTO> getEnlevementById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/enlevements/{} - société {}", id, societeId);
        
        try {
            EnlevementDTO enlevement = enlevementService.getEnlevementById(id);
            
            // Vérifier que l'enlèvement appartient bien à la société du client
            if (enlevement.getSocieteId() == null || !enlevement.getSocieteId().equals(societeId)) {
                log.warn("Tentative d'accès à un enlèvement d'une autre société: enlevement.societeId={}, user.societeId={}", 
                        enlevement.getSocieteId(), societeId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(enlevement);
        } catch (IllegalArgumentException e) {
            log.error("Enlèvement non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Liste les enlèvements de la société du client (paginé)
     */
    @GetMapping
    @Operation(summary = "Mes enlèvements", description = "Récupère la liste paginée des enlèvements de la société")
    public ResponseEntity<Page<EnlevementDTO>> getEnlevements(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "dateEnlevement", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/enlevements - société {}", societeId);
        
        Page<EnlevementDTO> enlevements = enlevementService.getEnlevementsBySociete(societeId, pageable);
        return ResponseEntity.ok(enlevements);
    }
}

