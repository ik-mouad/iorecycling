package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateDestinationRequest;
import ma.iorecycling.dto.DestinationDTO;
import ma.iorecycling.dto.UpdateDestinationRequest;
import ma.iorecycling.service.DestinationService;
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
 * Controller REST pour la gestion administrative des destinations
 */
@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Destinations", description = "API pour la gestion des destinations (centres de tri/traitement)")
@PreAuthorize("hasRole('ADMIN') or hasRole('BACKOFFICE')")
public class AdminDestinationController {
    
    private final DestinationService destinationService;
    
    /**
     * Crée une nouvelle destination
     */
    @PostMapping
    @Operation(summary = "Créer une destination", description = "Crée une nouvelle destination (centre de tri/traitement)")
    public ResponseEntity<DestinationDTO> createDestination(@Valid @RequestBody CreateDestinationRequest request) {
        log.info("POST /api/admin/destinations - Création destination {}", request.getRaisonSociale());
        
        try {
            DestinationDTO destination = destinationService.createDestination(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(destination);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création destination : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste toutes les destinations avec pagination
     */
    @GetMapping
    @Operation(summary = "Lister les destinations", description = "Récupère la liste paginée de toutes les destinations")
    public ResponseEntity<Page<DestinationDTO>> getAllDestinations(
            @PageableDefault(size = 20, sort = "raisonSociale", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) String search) {
        
        log.info("GET /api/admin/destinations - Page {}, Size {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<DestinationDTO> destinations;
        if (search != null && !search.trim().isEmpty()) {
            destinations = destinationService.search(search, pageable);
        } else {
            destinations = destinationService.getAllDestinations(pageable);
        }
        
        return ResponseEntity.ok(destinations);
    }
    
    /**
     * Liste toutes les destinations (pour sélection dans formulaire)
     */
    @GetMapping("/all")
    @Operation(summary = "Lister toutes les destinations", description = "Récupère la liste complète de toutes les destinations")
    public ResponseEntity<List<DestinationDTO>> getAllDestinationsList() {
        log.info("GET /api/admin/destinations/all");
        
        List<DestinationDTO> destinations = destinationService.getAllDestinations();
        return ResponseEntity.ok(destinations);
    }
    
    /**
     * Liste les destinations pour déchets dangereux
     */
    @GetMapping("/dechets-dangereux")
    @Operation(summary = "Destinations pour déchets dangereux", description = "Récupère les destinations pouvant traiter les déchets dangereux (A_DETRUIRE)")
    public ResponseEntity<List<DestinationDTO>> getDestinationsPourDechetsDangereux() {
        log.info("GET /api/admin/destinations/dechets-dangereux");
        
        List<DestinationDTO> destinations = destinationService.getDestinationsPourDechetsDangereux();
        return ResponseEntity.ok(destinations);
    }
    
    /**
     * Récupère une destination par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une destination", description = "Récupère les détails d'une destination par son ID")
    public ResponseEntity<DestinationDTO> getDestinationById(@PathVariable Long id) {
        log.info("GET /api/admin/destinations/{}", id);
        
        try {
            DestinationDTO destination = destinationService.getDestinationById(id);
            return ResponseEntity.ok(destination);
        } catch (IllegalArgumentException e) {
            log.error("Destination non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour une destination
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour une destination", description = "Met à jour les informations d'une destination")
    public ResponseEntity<DestinationDTO> updateDestination(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDestinationRequest request) {
        
        log.info("PUT /api/admin/destinations/{}", id);
        
        try {
            DestinationDTO destination = destinationService.updateDestination(id, request);
            return ResponseEntity.ok(destination);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour destination : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime une destination
     * Accessible uniquement aux ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une destination", description = "Supprime une destination")
    public ResponseEntity<Void> deleteDestination(@PathVariable Long id) {
        log.info("DELETE /api/admin/destinations/{}", id);
        
        try {
            destinationService.deleteDestination(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Destination non trouvée : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

