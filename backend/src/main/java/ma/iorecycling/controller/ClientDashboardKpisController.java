package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DashboardKpisDTO;
import ma.iorecycling.service.ClientContextService;
import ma.iorecycling.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller REST pour le dashboard client avec les 5 KPIs
 */
@RestController
@RequestMapping("/api/client/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Dashboard", description = "API pour les KPIs du portail client")
@PreAuthorize("hasRole('CLIENT')")
public class ClientDashboardKpisController {
    
    private final DashboardService dashboardService;
    private final ClientContextService clientContextService;
    
    /**
     * Récupère tous les KPIs pour une période
     */
    @GetMapping("/kpis")
    @Operation(summary = "KPIs du dashboard", description = "Récupère les 5 KPIs principaux pour la période")
    public ResponseEntity<DashboardKpisDTO> getKpis(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        
        // Si pas de dates, utiliser le mois en cours
        if (dateDebut == null) {
            dateDebut = LocalDate.now().withDayOfMonth(1);
        }
        if (dateFin == null) {
            dateFin = LocalDate.now();
        }
        
        log.info("GET /api/client/dashboard/kpis - société {} du {} au {}", societeId, dateDebut, dateFin);
        
        DashboardKpisDTO kpis = dashboardService.calculateKpis(societeId, dateDebut, dateFin);
        return ResponseEntity.ok(kpis);
    }
    
    /**
     * KPI 3 : Nombre d'enlèvements
     */
    @GetMapping("/count")
    @Operation(summary = "Nombre d'enlèvements", description = "Récupère le nombre total d'enlèvements sur la période")
    public ResponseEntity<Long> getEnlevementsCount(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        
        if (dateDebut == null) {
            dateDebut = LocalDate.now().withDayOfMonth(1);
        }
        if (dateFin == null) {
            dateFin = LocalDate.now();
        }
        
        DashboardKpisDTO kpis = dashboardService.calculateKpis(societeId, dateDebut, dateFin);
        return ResponseEntity.ok(kpis.getNombreEnlevements());
    }
}

