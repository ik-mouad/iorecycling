package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DemandeEnlevementDTO;
import ma.iorecycling.dto.ValiderDemandeRequest;
import ma.iorecycling.service.DemandeEnlevementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour traiter les demandes d'enlèvements (côté admin)
 */
@RestController
@RequestMapping("/api/admin/demandes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Demandes", description = "API pour traiter les demandes d'enlèvements")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDemandeController {
    
    private final DemandeEnlevementService demandeService;
    
    /**
     * Liste toutes les demandes EN_ATTENTE
     */
    @GetMapping("/en-attente")
    @Operation(summary = "Demandes en attente", description = "Récupère toutes les demandes en attente de traitement")
    public ResponseEntity<List<DemandeEnlevementDTO>> getDemandesEnAttente() {
        log.info("GET /api/admin/demandes/en-attente");
        
        List<DemandeEnlevementDTO> demandes = demandeService.getDemandesEnAttente();
        return ResponseEntity.ok(demandes);
    }
    
    /**
     * Valide une demande avec possibilité de modifier la date/heure
     */
    @PutMapping("/{id}/valider")
    @Operation(summary = "Valider une demande", description = "Valider une demande EN_ATTENTE avec possibilité de modifier la date/heure")
    public ResponseEntity<DemandeEnlevementDTO> validerDemande(
            @PathVariable Long id,
            @RequestBody(required = false) ValiderDemandeRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("PUT /api/admin/demandes/{}/valider", id);
        
        try {
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "admin";
            DemandeEnlevementDTO demande = demandeService.validerDemande(id, username, request);
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Erreur validation demande : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Refuse une demande
     */
    @PutMapping("/{id}/refuser")
    @Operation(summary = "Refuser une demande", description = "Refuser une demande avec motif")
    public ResponseEntity<DemandeEnlevementDTO> refuserDemande(
            @PathVariable Long id,
            @RequestParam String motifRefus,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("PUT /api/admin/demandes/{}/refuser", id);
        
        try {
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "admin";
            DemandeEnlevementDTO demande = demandeService.refuserDemande(id, motifRefus, username);
            return ResponseEntity.ok(demande);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Erreur refus demande : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

