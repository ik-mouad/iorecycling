package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateDemandeEnlevementRequest;
import ma.iorecycling.dto.DemandeEnlevementDTO;
import ma.iorecycling.service.DemandeEnlevementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST pour les demandes d'enlèvements (côté client)
 */
@RestController
@RequestMapping("/api/client/demandes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Demandes", description = "API pour demander des enlèvements")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class ClientDemandeController {
    
    private final DemandeEnlevementService demandeService;
    private final ma.iorecycling.service.ClientContextService clientContextService;
    
    /**
     * Crée une nouvelle demande d'enlèvement
     */
    @PostMapping
    @Operation(summary = "Créer une demande", description = "Demander un enlèvement ponctuel")
    public ResponseEntity<DemandeEnlevementDTO> createDemande(
            @Valid @RequestBody CreateDemandeEnlevementRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Forcer le societeId depuis le JWT (sécurité)
        request.setSocieteId(societeId);
        
        log.info("POST /api/client/demandes - société {}", societeId);
        
        try {
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "client";
            
            DemandeEnlevementDTO demande = demandeService.createDemande(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(demande);
            
        } catch (IllegalArgumentException e) {
            log.error("Erreur création demande : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste les demandes de la société du client
     */
    @GetMapping
    @Operation(summary = "Mes demandes", description = "Liste toutes les demandes de ma société")
    public ResponseEntity<Page<DemandeEnlevementDTO>> getMesDemandes(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/demandes - société {}", societeId);
        
        Page<DemandeEnlevementDTO> demandes = demandeService.getDemandesBySociete(societeId, pageable);
        return ResponseEntity.ok(demandes);
    }
    
    /**
     * Annule une demande
     */
    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annuler une demande", description = "Annuler une demande EN_ATTENTE ou VALIDEE")
    public ResponseEntity<DemandeEnlevementDTO> annulerDemande(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("PUT /api/client/demandes/{}/annuler - société {}", id, societeId);
        
        try {
            DemandeEnlevementDTO demande = demandeService.annulerDemande(id, societeId);
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Erreur annulation demande : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

