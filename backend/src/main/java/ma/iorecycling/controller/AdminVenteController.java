package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.Vente;
import ma.iorecycling.service.VenteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion administrative des ventes
 */
@RestController
@RequestMapping("/api/admin/ventes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Ventes", description = "API pour la gestion des ventes de déchets")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class AdminVenteController {
    
    private final VenteService venteService;
    
    // ========== VENTES ==========
    
    /**
     * Crée une nouvelle vente
     */
    @PostMapping
    @Operation(summary = "Créer une vente", description = "Crée une nouvelle vente de déchets")
    public ResponseEntity<VenteDTO> createVente(
            @Valid @RequestBody CreateVenteRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/ventes - Création vente");
        
        try {
            String createdBy = jwt.getSubject();
            VenteDTO dto = venteService.createVente(request, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la création de la vente", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste toutes les ventes avec pagination
     */
    @GetMapping
    @Operation(summary = "Liste les ventes", description = "Liste toutes les ventes avec pagination")
    public ResponseEntity<Page<VenteDTO>> getAllVentes(
            @PageableDefault(sort = "dateVente", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("GET /api/admin/ventes");
        
        try {
            Page<VenteDTO> ventes = venteService.getAllVentes(pageable);
            return ResponseEntity.ok(ventes);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des ventes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste les ventes par statut
     */
    @GetMapping("/statut/{statut}")
    @Operation(summary = "Liste les ventes par statut", description = "Liste les ventes filtrées par statut")
    public ResponseEntity<Page<VenteDTO>> getVentesByStatut(
            @PathVariable String statut,
            @PageableDefault(sort = "dateVente", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("GET /api/admin/ventes/statut/{}", statut);
        
        try {
            Vente.StatutVente statutVente = Vente.StatutVente.valueOf(statut);
            Page<VenteDTO> ventes = venteService.getVentesByStatut(statutVente, pageable);
            return ResponseEntity.ok(ventes);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des ventes par statut", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupère une vente par ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Récupère une vente", description = "Récupère les détails d'une vente")
    public ResponseEntity<VenteDTO> getVente(@PathVariable Long id) {
        log.info("GET /api/admin/ventes/{}", id);
        
        try {
            VenteDTO dto = venteService.getVenteById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la vente {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Valide une vente (génère les transactions comptables)
     */
    @PostMapping("/{id}/valider")
    @Operation(summary = "Valider une vente", description = "Valide une vente et génère les transactions comptables")
    public ResponseEntity<VenteDTO> validerVente(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/ventes/{}/valider", id);
        
        try {
            String createdBy = jwt.getSubject();
            VenteDTO dto = venteService.validerVente(id, createdBy);
            return ResponseEntity.ok(dto);
        } catch (IllegalStateException e) {
            log.error("Erreur de validation de la vente {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Erreur lors de la validation de la vente {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== STOCKS DISPONIBLES ==========
    
    /**
     * Récupère les stocks disponibles à la vente
     */
    @GetMapping("/stocks")
    @Operation(summary = "Stocks disponibles", description = "Récupère les stocks disponibles à la vente")
    public ResponseEntity<List<StockDisponibleDTO>> getStocksDisponibles(
            @RequestParam(required = false) Long societeId,
            @RequestParam(required = false) String typeDechet,
            @RequestParam(required = false) String sousType) {
        
        log.info("GET /api/admin/ventes/stocks - Société: {}, Type: {}, Sous-type: {}", 
                societeId, typeDechet, sousType);
        
        try {
            List<StockDisponibleDTO> stocks = venteService.getStocksDisponibles(societeId, typeDechet, sousType);
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des stocks disponibles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

