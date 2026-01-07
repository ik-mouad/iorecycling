package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSocieteProprietaireRequest;
import ma.iorecycling.dto.SocieteProprietaireDTO;
import ma.iorecycling.dto.UpdateSocieteProprietaireRequest;
import ma.iorecycling.service.SocieteProprietaireService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion administrative des sociétés propriétaires de camions
 */
@RestController
@RequestMapping("/api/admin/societes-proprietaires")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Sociétés Propriétaires", description = "API pour la gestion des sociétés propriétaires de camions")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class AdminSocieteProprietaireController {
    
    private final SocieteProprietaireService societeProprietaireService;
    
    /**
     * Crée une nouvelle société propriétaire
     */
    @PostMapping
    @Operation(summary = "Créer une société propriétaire", description = "Crée une nouvelle société propriétaire de camions")
    public ResponseEntity<SocieteProprietaireDTO> createSocieteProprietaire(@Valid @RequestBody CreateSocieteProprietaireRequest request) {
        log.info("POST /api/admin/societes-proprietaires - Création société {}", request.getRaisonSociale());
        
        try {
            SocieteProprietaireDTO societe = societeProprietaireService.createSocieteProprietaire(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(societe);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création société propriétaire : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste toutes les sociétés propriétaires avec pagination
     */
    @GetMapping
    @Operation(summary = "Lister les sociétés propriétaires", description = "Récupère la liste paginée de toutes les sociétés propriétaires")
    public ResponseEntity<Page<SocieteProprietaireDTO>> getAllSocietesProprietaires(
            @PageableDefault(size = 20, sort = "raisonSociale", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) String search) {
        
        log.info("GET /api/admin/societes-proprietaires - Page {}, Size {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<SocieteProprietaireDTO> societes;
        if (search != null && !search.trim().isEmpty()) {
            societes = societeProprietaireService.search(search, pageable);
        } else {
            societes = societeProprietaireService.getAllSocietesProprietaires(pageable);
        }
        
        return ResponseEntity.ok(societes);
    }
    
    /**
     * Liste toutes les sociétés propriétaires actives (pour sélection dans formulaire)
     */
    @GetMapping("/actives")
    @Operation(summary = "Lister les sociétés propriétaires actives", description = "Récupère la liste de toutes les sociétés propriétaires actives")
    public ResponseEntity<List<SocieteProprietaireDTO>> getActiveSocietesProprietaires() {
        log.info("GET /api/admin/societes-proprietaires/actives");
        
        List<SocieteProprietaireDTO> societes = societeProprietaireService.getActiveSocietesProprietaires();
        return ResponseEntity.ok(societes);
    }
    
    /**
     * Récupère une société propriétaire par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une société propriétaire", description = "Récupère les détails d'une société propriétaire par son ID")
    public ResponseEntity<SocieteProprietaireDTO> getSocieteProprietaireById(@PathVariable Long id) {
        log.info("GET /api/admin/societes-proprietaires/{}", id);
        
        try {
            SocieteProprietaireDTO societe = societeProprietaireService.getSocieteProprietaireById(id);
            return ResponseEntity.ok(societe);
        } catch (IllegalArgumentException e) {
            log.error("Société propriétaire non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour une société propriétaire
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une société propriétaire", description = "Met à jour les informations d'une société propriétaire")
    public ResponseEntity<SocieteProprietaireDTO> updateSocieteProprietaire(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSocieteProprietaireRequest request) {
        
        log.info("PUT /api/admin/societes-proprietaires/{}", id);
        
        try {
            SocieteProprietaireDTO societe = societeProprietaireService.updateSocieteProprietaire(id, request);
            return ResponseEntity.ok(societe);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour société propriétaire : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime une société propriétaire
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une société propriétaire", description = "Supprime une société propriétaire")
    public ResponseEntity<Void> deleteSocieteProprietaire(@PathVariable Long id) {
        log.info("DELETE /api/admin/societes-proprietaires/{}", id);
        
        try {
            societeProprietaireService.deleteSocieteProprietaire(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Société propriétaire non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

