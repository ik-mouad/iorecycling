package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.PlanningEnlevementDTO;
import ma.iorecycling.service.PlanningService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Controller REST pour la gestion du planning
 */
@RestController
@RequestMapping("/api/admin/planning")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Planning", description = "API pour la gestion du planning des enlèvements")
@PreAuthorize("hasRole('ADMIN') or hasRole('BACKOFFICE')")
public class PlanningController {
    
    private final PlanningService planningService;
    
    /**
     * Récupère le planning d'un mois
     */
    @GetMapping("/mois/{annee}/{mois}")
    @Operation(summary = "Planning du mois", description = "Récupère tous les enlèvements planifiés d'un mois")
    public ResponseEntity<List<PlanningEnlevementDTO>> getPlanningDuMois(
            @PathVariable int annee,
            @PathVariable int mois) {
        
        log.info("GET /api/admin/planning/mois/{}/{}", annee, mois);
        
        YearMonth yearMonth = YearMonth.of(annee, mois);
        List<PlanningEnlevementDTO> planning = planningService.getPlanningDuMois(yearMonth);
        
        return ResponseEntity.ok(planning);
    }
    
    /**
     * Récupère le planning d'un jour
     */
    @GetMapping("/jour/{date}")
    @Operation(summary = "Planning du jour", description = "Récupère les enlèvements planifiés d'une date")
    public ResponseEntity<List<PlanningEnlevementDTO>> getPlanningDuJour(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("GET /api/admin/planning/jour/{}", date);
        
        List<PlanningEnlevementDTO> planning = planningService.getPlanningDuJour(date);
        return ResponseEntity.ok(planning);
    }
    
    /**
     * Crée un enlèvement planifié manuel
     */
    @PostMapping
    @Operation(summary = "Créer planning manuel", description = "Ajoute un enlèvement planifié manuellement")
    public ResponseEntity<PlanningEnlevementDTO> createPlanningManuel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datePrevue,
            @RequestParam(required = false) String heurePrevue,
            @RequestParam Long siteId,
            @RequestParam Long societeId,
            @RequestParam(required = false) String commentaire) {
        
        log.info("POST /api/admin/planning - société {} le {}", societeId, datePrevue);
        
        try {
            PlanningEnlevementDTO planning = planningService.createPlanningManuel(
                    datePrevue, heurePrevue, siteId, societeId, commentaire);
            
            return ResponseEntity.ok(planning);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création planning : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Modifie un enlèvement planifié
     */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier planning", description = "Modifie la date/heure d'un enlèvement planifié")
    public ResponseEntity<PlanningEnlevementDTO> modifierPlanning(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datePrevue,
            @RequestParam(required = false) String heurePrevue) {
        
        log.info("PUT /api/admin/planning/{}", id);
        
        try {
            PlanningEnlevementDTO planning = planningService.modifierPlanning(id, datePrevue, heurePrevue);
            return ResponseEntity.ok(planning);
        } catch (IllegalArgumentException e) {
            log.error("Erreur modification planning : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Annule un enlèvement planifié
     */
    @PutMapping("/{id}/annuler")
    @Operation(summary = "Annuler planning", description = "Annule un enlèvement planifié")
    public ResponseEntity<PlanningEnlevementDTO> annulerPlanning(@PathVariable Long id) {
        log.info("PUT /api/admin/planning/{}/annuler", id);
        
        try {
            PlanningEnlevementDTO planning = planningService.annulerPlanning(id);
            return ResponseEntity.ok(planning);
        } catch (IllegalArgumentException e) {
            log.error("Erreur annulation planning : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime un enlèvement planifié
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer planning", description = "Supprime un enlèvement planifié")
    public ResponseEntity<Void> supprimerPlanning(@PathVariable Long id) {
        log.info("DELETE /api/admin/planning/{}", id);
        
        try {
            planningService.supprimerPlanning(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Planning non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

