package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateEnlevementRequest;
import ma.iorecycling.dto.EnlevementDTO;
import ma.iorecycling.service.EnlevementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller REST pour la gestion administrative des enlèvements
 */
@RestController
@RequestMapping("/api/admin/enlevements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Enlèvements", description = "API pour la gestion des enlèvements")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class AdminEnlevementController {
    
    private final EnlevementService enlevementService;
    
    /**
     * Crée un nouvel enlèvement
     */
    @PostMapping
    @Operation(summary = "Créer un enlèvement", description = "Crée un nouvel enlèvement avec ses items")
    public ResponseEntity<EnlevementDTO> createEnlevement(
            @Valid @RequestBody CreateEnlevementRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/enlevements - Création enlèvement pour société {}", request.getSocieteId());
        
        try {
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "admin";
            EnlevementDTO enlevement = enlevementService.createEnlevement(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(enlevement);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création enlèvement : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère un enlèvement par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un enlèvement", description = "Récupère les détails d'un enlèvement par son ID")
    public ResponseEntity<EnlevementDTO> getEnlevementById(@PathVariable Long id) {
        log.info("GET /api/admin/enlevements/{}", id);
        
        try {
            EnlevementDTO enlevement = enlevementService.getEnlevementById(id);
            return ResponseEntity.ok(enlevement);
        } catch (IllegalArgumentException e) {
            log.error("Enlèvement non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Liste les enlèvements (tous ou filtrés par société)
     */
    @GetMapping
    @Operation(summary = "Lister les enlèvements", description = "Récupère la liste paginée des enlèvements")
    public ResponseEntity<Page<EnlevementDTO>> getEnlevements(
            @RequestParam(required = false) Long societeId,
            @PageableDefault(size = 20, sort = "dateEnlevement", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("GET /api/admin/enlevements - société {}", societeId);
        
        if (societeId != null) {
            Page<EnlevementDTO> enlevements = enlevementService.getEnlevementsBySociete(societeId, pageable);
            return ResponseEntity.ok(enlevements);
        }
        
        // Récupérer tous les enlèvements
        Page<EnlevementDTO> enlevements = enlevementService.getAllEnlevements(pageable);
        return ResponseEntity.ok(enlevements);
    }
    
    /**
     * Récupère les enlèvements entre deux dates
     */
    @GetMapping("/search")
    @Operation(summary = "Rechercher des enlèvements", description = "Recherche les enlèvements par société et période")
    public ResponseEntity<List<EnlevementDTO>> searchEnlevements(
            @RequestParam Long societeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        log.info("GET /api/admin/enlevements/search - société {} du {} au {}", societeId, dateDebut, dateFin);
        
        List<EnlevementDTO> enlevements = enlevementService.getEnlevementsBySocieteAndDateRange(
                societeId, dateDebut, dateFin);
        
        return ResponseEntity.ok(enlevements);
    }
    
    /**
     * Supprime un enlèvement
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un enlèvement", description = "Supprime un enlèvement et ses items")
    public ResponseEntity<Void> deleteEnlevement(@PathVariable Long id) {
        log.info("DELETE /api/admin/enlevements/{}", id);
        
        try {
            enlevementService.deleteEnlevement(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Enlèvement non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Régénère les transactions comptables pour un enlèvement
     */
    @PostMapping("/{id}/regenerate-transactions")
    @Operation(summary = "Régénérer les transactions", description = "Régénère les transactions comptables pour un enlèvement existant")
    public ResponseEntity<Void> regenerateTransactions(@PathVariable Long id) {
        log.info("POST /api/admin/enlevements/{}/regenerate-transactions", id);
        
        try {
            enlevementService.regenerateTransactions(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Erreur lors de la régénération des transactions : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erreur inattendue lors de la régénération des transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupère les transactions d'un enlèvement
     */
    @GetMapping("/{id}/transactions")
    @Operation(summary = "Transactions d'un enlèvement", description = "Récupère toutes les transactions liées à un enlèvement")
    public ResponseEntity<List<ma.iorecycling.dto.TransactionDTO>> getEnlevementTransactions(@PathVariable Long id) {
        log.info("GET /api/admin/enlevements/{}/transactions", id);
        try {
            EnlevementDTO enlevement = enlevementService.getEnlevementById(id);
            return ResponseEntity.ok(enlevement.getTransactions() != null ? enlevement.getTransactions() : List.of());
        } catch (IllegalArgumentException e) {
            log.error("Enlèvement non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

