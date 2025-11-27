package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSiteRequest;
import ma.iorecycling.dto.SiteDTO;
import ma.iorecycling.service.SiteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des sites
 */
@RestController
@RequestMapping("/api/admin/sites")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Sites", description = "API pour la gestion des sites de collecte")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSiteController {
    
    private final SiteService siteService;
    
    /**
     * Crée un nouveau site
     */
    @PostMapping
    @Operation(summary = "Créer un site", description = "Crée un nouveau site pour une société")
    public ResponseEntity<SiteDTO> createSite(@Valid @RequestBody CreateSiteRequest request) {
        log.info("POST /api/admin/sites - Création site {}", request.getName());
        
        try {
            SiteDTO site = siteService.createSite(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(site);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création site : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère un site par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un site", description = "Récupère les détails d'un site par son ID")
    public ResponseEntity<SiteDTO> getSiteById(@PathVariable Long id) {
        log.info("GET /api/admin/sites/{}", id);
        
        try {
            SiteDTO site = siteService.getSiteById(id);
            return ResponseEntity.ok(site);
        } catch (IllegalArgumentException e) {
            log.error("Site non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour un site
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un site", description = "Met à jour les informations d'un site")
    public ResponseEntity<SiteDTO> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody CreateSiteRequest request) {
        
        log.info("PUT /api/admin/sites/{}", id);
        
        try {
            SiteDTO site = siteService.updateSite(id, request);
            return ResponseEntity.ok(site);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour site : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime un site
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un site", description = "Supprime un site et ses enlèvements")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        log.info("DELETE /api/admin/sites/{}", id);
        
        try {
            siteService.deleteSite(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Site non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

/**
 * Controller pour les endpoints spécifiques aux sociétés
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sociétés - Sites", description = "API pour les sites d'une société")
@PreAuthorize("hasRole('ADMIN')")
class SocietesSitesController {
    
    private final SiteService siteService;
    
    /**
     * Récupère tous les sites d'une société
     */
    @GetMapping("/api/admin/societes/{societeId}/sites")
    @Operation(summary = "Sites d'une société", description = "Récupère tous les sites d'une société")
    public ResponseEntity<List<SiteDTO>> getSitesBySociete(@PathVariable Long societeId) {
        log.info("GET /api/admin/societes/{}/sites", societeId);
        
        List<SiteDTO> sites = siteService.getSitesBySociete(societeId);
        return ResponseEntity.ok(sites);
    }
    
    /**
     * Crée un site pour une société (alternative endpoint)
     */
    @PostMapping("/api/admin/societes/{societeId}/sites")
    @Operation(summary = "Ajouter un site à une société", description = "Crée un nouveau site pour une société")
    public ResponseEntity<SiteDTO> createSiteForSociete(
            @PathVariable Long societeId,
            @Valid @RequestBody CreateSiteRequest request) {
        
        log.info("POST /api/admin/societes/{}/sites", societeId);
        
        // Forcer le societeId depuis l'URL
        request.setSocieteId(societeId);
        
        try {
            SiteDTO site = siteService.createSite(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(site);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création site : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

/**
 * Controller REST pour la consultation des sites (Client)
 */
@RestController
@RequestMapping("/api/client/sites")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Sites", description = "API pour consulter les sites de la société du client")
@PreAuthorize("hasRole('CLIENT')")
class ClientSiteController {
    
    private final SiteService siteService;
    private final ma.iorecycling.service.ClientContextService clientContextService;
    
    /**
     * Récupère tous les sites de la société du client
     */
    @GetMapping
    @Operation(summary = "Mes sites", description = "Récupère tous les sites de la société du client")
    public ResponseEntity<List<SiteDTO>> getMySites(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/sites - société {}", societeId);
        
        List<SiteDTO> sites = siteService.getSitesBySociete(societeId);
        return ResponseEntity.ok(sites);
    }
}

