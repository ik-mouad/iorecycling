package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateRecurrenceRequest;
import ma.iorecycling.dto.RecurrenceDTO;
import ma.iorecycling.service.RecurrenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des récurrences
 */
@RestController
@RequestMapping("/api/admin/recurrences")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Récurrences", description = "API pour la gestion des récurrences d'enlèvements")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class RecurrenceController {
    
    private final RecurrenceService recurrenceService;
    
    /**
     * Crée une nouvelle récurrence
     */
    @PostMapping
    @Operation(summary = "Créer récurrence", description = "Crée une récurrence d'enlèvements (hebdo, bimensuelle, mensuelle)")
    public ResponseEntity<RecurrenceDTO> createRecurrence(@Valid @RequestBody CreateRecurrenceRequest request) {
        log.info("POST /api/admin/recurrences - type {}", request.getTypeRecurrence());
        
        try {
            RecurrenceDTO recurrence = recurrenceService.createRecurrence(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(recurrence);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création récurrence : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste toutes les récurrences actives
     */
    @GetMapping
    @Operation(summary = "Lister récurrences actives", description = "Récupère toutes les récurrences actives")
    public ResponseEntity<List<RecurrenceDTO>> getRecurrencesActives() {
        log.info("GET /api/admin/recurrences");
        
        List<RecurrenceDTO> recurrences = recurrenceService.getRecurrencesActives();
        return ResponseEntity.ok(recurrences);
    }
    
    /**
     * Liste les récurrences d'une société
     */
    @GetMapping("/societe/{societeId}")
    @Operation(summary = "Récurrences d'une société", description = "Récupère les récurrences d'une société")
    public ResponseEntity<List<RecurrenceDTO>> getRecurrencesBySociete(@PathVariable Long societeId) {
        log.info("GET /api/admin/recurrences/societe/{}", societeId);
        
        List<RecurrenceDTO> recurrences = recurrenceService.getRecurrencesBySociete(societeId);
        return ResponseEntity.ok(recurrences);
    }
    
    /**
     * Désactive une récurrence
     */
    @PutMapping("/{id}/desactiver")
    @Operation(summary = "Désactiver récurrence", description = "Désactive une récurrence (arrête la génération automatique)")
    public ResponseEntity<RecurrenceDTO> desactiverRecurrence(@PathVariable Long id) {
        log.info("PUT /api/admin/recurrences/{}/desactiver", id);
        
        try {
            RecurrenceDTO recurrence = recurrenceService.desactiverRecurrence(id);
            return ResponseEntity.ok(recurrence);
        } catch (IllegalArgumentException e) {
            log.error("Récurrence non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Supprime une récurrence
     * @param id ID de la récurrence à supprimer
     * @param supprimerToutesOccurrences Si true, supprime toutes les occurrences (passées et futures), 
     *                                   si false, supprime uniquement les occurrences futures (défaut: false)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer récurrence", description = "Supprime une récurrence et optionnellement ses occurrences du planning")
    public ResponseEntity<Void> supprimerRecurrence(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean supprimerToutesOccurrences) {
        log.info("DELETE /api/admin/recurrences/{} (supprimer toutes occurrences: {})", id, supprimerToutesOccurrences);
        
        try {
            recurrenceService.supprimerRecurrence(id, supprimerToutesOccurrences);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Récurrence non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

