package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSocieteRequest;
import ma.iorecycling.dto.SocieteDTO;
import ma.iorecycling.dto.UpdateSocieteRequest;
import ma.iorecycling.service.SocieteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST pour la gestion administrative des sociétés
 */
@RestController
@RequestMapping("/api/admin/societes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Sociétés", description = "API pour la gestion des sociétés clientes")
public class AdminSocieteController {
    
    private final SocieteService societeService;
    
    /**
     * Crée une nouvelle société
     * Accessible uniquement aux ADMIN
     */
    @PostMapping
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
    @Operation(summary = "Créer une société", description = "Crée une nouvelle société cliente")
    public ResponseEntity<SocieteDTO> createSociete(@Valid @RequestBody CreateSocieteRequest request) {
        log.info("POST /api/admin/societes - Création société {}", request.getRaisonSociale());
        
        try {
            SocieteDTO societe = societeService.createSociete(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(societe);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création société : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste toutes les sociétés
     * Accessible aux ADMIN et COMPTABLE (lecture seule pour les comptables)
     */
    @GetMapping
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
    @Operation(summary = "Lister les sociétés", description = "Récupère la liste paginée de toutes les sociétés")
    public ResponseEntity<Page<SocieteDTO>> getAllSocietes(
            @PageableDefault(size = 20, sort = "raisonSociale", direction = Sort.Direction.ASC) Pageable pageable) {
        
        log.info("GET /api/admin/societes - Page {}, Size {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<SocieteDTO> societes = societeService.getAllSocietes(pageable);
        return ResponseEntity.ok(societes);
    }
    
    /**
     * Récupère une société par son ID
     * Accessible aux ADMIN et COMPTABLE (lecture seule pour les comptables)
     */
    @GetMapping("/{id}")
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
    @Operation(summary = "Détail d'une société", description = "Récupère les détails d'une société par son ID")
    public ResponseEntity<SocieteDTO> getSocieteById(@PathVariable Long id) {
        log.info("GET /api/admin/societes/{}", id);
        
        try {
            SocieteDTO societe = societeService.getSocieteById(id);
            return ResponseEntity.ok(societe);
        } catch (IllegalArgumentException e) {
            log.error("Société non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour une société
     * Accessible uniquement aux ADMIN
     */
    @PutMapping("/{id}")
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
    @Operation(summary = "Mettre à jour une société", description = "Met à jour les informations d'une société (ICE non modifiable)")
    public ResponseEntity<SocieteDTO> updateSociete(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSocieteRequest request) {
        
        log.info("PUT /api/admin/societes/{}", id);
        
        try {
            SocieteDTO societe = societeService.updateSociete(id, request);
            return ResponseEntity.ok(societe);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour société : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime une société
     * Accessible uniquement aux ADMIN
     */
    @DeleteMapping("/{id}")
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
    @Operation(summary = "Supprimer une société", description = "Supprime une société et toutes ses données (sites, utilisateurs, enlèvements)")
    public ResponseEntity<Void> deleteSociete(@PathVariable Long id) {
        log.info("DELETE /api/admin/societes/{}", id);
        
        try {
            societeService.deleteSociete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Société non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

