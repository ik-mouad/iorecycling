package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CamionDTO;
import ma.iorecycling.dto.CreateCamionRequest;
import ma.iorecycling.dto.UpdateCamionRequest;
import ma.iorecycling.entity.TypeCamion;
import ma.iorecycling.service.CamionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion administrative des camions
 */
@RestController
@RequestMapping("/api/admin/camions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Camions", description = "API pour la gestion de la flotte de camions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCamionController {
    
    private final CamionService camionService;
    
    /**
     * Crée un nouveau camion
     */
    @PostMapping
    @Operation(summary = "Créer un camion", description = "Crée un nouveau camion dans la flotte")
    public ResponseEntity<CamionDTO> createCamion(@Valid @RequestBody CreateCamionRequest request) {
        log.info("POST /api/admin/camions - Création camion {}", request.getMatricule());
        
        try {
            CamionDTO camion = camionService.createCamion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(camion);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création camion : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste tous les camions avec pagination
     */
    @GetMapping
    @Operation(summary = "Lister les camions", description = "Récupère la liste paginée de tous les camions")
    public ResponseEntity<Page<CamionDTO>> getAllCamions(
            @PageableDefault(size = 20, sort = "matricule", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(required = false) Long societeProprietaireId,
            @RequestParam(required = false) TypeCamion typeCamion) {
        
        log.info("GET /api/admin/camions - Page {}, Size {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<CamionDTO> camions;
        if (actif != null || societeProprietaireId != null || typeCamion != null) {
            camions = camionService.findWithFilters(actif, societeProprietaireId, typeCamion, pageable);
        } else {
            camions = camionService.getAllCamions(pageable);
        }
        
        return ResponseEntity.ok(camions);
    }
    
    /**
     * Liste tous les camions actifs (pour sélection dans formulaire)
     */
    @GetMapping("/actifs")
    @Operation(summary = "Lister les camions actifs", description = "Récupère la liste de tous les camions actifs")
    public ResponseEntity<List<CamionDTO>> getActiveCamions() {
        log.info("GET /api/admin/camions/actifs");
        
        List<CamionDTO> camions = camionService.getActiveCamions();
        return ResponseEntity.ok(camions);
    }
    
    /**
     * Récupère un camion par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un camion", description = "Récupère les détails d'un camion par son ID")
    public ResponseEntity<CamionDTO> getCamionById(@PathVariable Long id) {
        log.info("GET /api/admin/camions/{}", id);
        
        try {
            CamionDTO camion = camionService.getCamionById(id);
            return ResponseEntity.ok(camion);
        } catch (IllegalArgumentException e) {
            log.error("Camion non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour un camion
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un camion", description = "Met à jour les informations d'un camion (matricule non modifiable)")
    public ResponseEntity<CamionDTO> updateCamion(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCamionRequest request) {
        
        log.info("PUT /api/admin/camions/{}", id);
        
        try {
            CamionDTO camion = camionService.updateCamion(id, request);
            return ResponseEntity.ok(camion);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour camion : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime un camion
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un camion", description = "Supprime un camion de la flotte")
    public ResponseEntity<Void> deleteCamion(@PathVariable Long id) {
        log.info("DELETE /api/admin/camions/{}", id);
        
        try {
            camionService.deleteCamion(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Camion non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Récupère les camions actifs par société propriétaire
     */
    @GetMapping("/societe-proprietaire/{societeProprietaireId}/actifs")
    @Operation(summary = "Camions actifs par société propriétaire", description = "Récupère la liste des camions actifs d'une société propriétaire")
    public ResponseEntity<List<CamionDTO>> getActiveCamionsBySocieteProprietaire(@PathVariable Long societeProprietaireId) {
        log.info("GET /api/admin/camions/societe-proprietaire/{}/actifs", societeProprietaireId);
        
        List<CamionDTO> camions = camionService.getActiveCamionsBySocieteProprietaire(societeProprietaireId);
        return ResponseEntity.ok(camions);
    }
}

