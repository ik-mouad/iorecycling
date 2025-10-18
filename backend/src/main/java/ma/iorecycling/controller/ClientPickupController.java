package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.PickupRowDTO;
import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.entity.PickupType;
import ma.iorecycling.service.ClientContextService;
import ma.iorecycling.service.PickupQueryService;
import ma.iorecycling.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

/**
 * Contrôleur REST pour les enlèvements côté client
 */
@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Pickups", description = "API pour la gestion des enlèvements côté client")
public class ClientPickupController {
    
    private final PickupQueryService pickupQueryService;
    private final ReportService reportService;
    private final ClientContextService clientContextService;
    
    /**
     * Liste les enlèvements d'un client avec pagination et filtrage
     */
    @GetMapping("/pickups")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    @Operation(summary = "Liste les enlèvements", description = "Récupère la liste paginée des enlèvements du client")
    public ResponseEntity<Page<PickupRowDTO>> getPickups(
            @Parameter(description = "Type d'enlèvement à filtrer") 
            @RequestParam(defaultValue = "ALL") PickupType type,
            @Parameter(description = "Numéro de page (0-based)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") 
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Format de sortie (json ou csv)") 
            @RequestParam(defaultValue = "json") String format) {
        
        Long clientId = clientContextService.getCurrentClientId();
        if (clientId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        log.debug("Récupération des enlèvements pour client {} avec filtre {}", clientId, type);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<PickupRowDTO> pickups = pickupQueryService.listPickups(clientId, type, pageable);
        
        if ("csv".equalsIgnoreCase(format)) {
            return exportToCsv(pickups.getContent());
        }
        
        return ResponseEntity.ok(pickups);
    }
    
    /**
     * Récupère le résumé de valorisation pour un mois donné
     */
    @GetMapping("/valorisables/summary")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    @Operation(summary = "Résumé de valorisation", description = "Récupère le résumé des produits valorisables pour un mois")
    public ResponseEntity<ValorSummaryDTO> getValorSummary(
            @Parameter(description = "Mois au format YYYY-MM") 
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        
        Long clientId = clientContextService.getCurrentClientId();
        if (clientId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        if (month == null) {
            month = YearMonth.now();
        }
        
        log.debug("Récupération du résumé de valorisation pour client {} et mois {}", clientId, month);
        
        ValorSummaryDTO summary = pickupQueryService.valorSummary(clientId, month);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Télécharge le rapport PDF de valorisation mensuel
     */
    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    @Operation(summary = "Rapport PDF", description = "Télécharge le rapport PDF de valorisation mensuel")
    public ResponseEntity<byte[]> downloadReport(
            @Parameter(description = "Mois au format YYYY-MM") 
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        
        Long clientId = clientContextService.getCurrentClientId();
        if (clientId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        if (month == null) {
            month = YearMonth.now();
        }
        
        log.debug("Génération du rapport PDF pour client {} et mois {}", clientId, month);
        
        try {
            ValorSummaryDTO summary = pickupQueryService.valorSummary(clientId, month);
            byte[] pdfContent = reportService.buildMonthlyValorPdf(clientId, month, summary);
            
            String filename = String.format("rapport-valorisation-%s.pdf", month);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfContent);
                    
        } catch (Exception e) {
            log.error("Erreur lors de la génération du rapport PDF: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Export CSV des enlèvements
     */
    private ResponseEntity<byte[]> exportToCsv(List<PickupRowDTO> pickups) {
        try {
            StringBuilder csv = new StringBuilder();
            csv.append("Date,Type,Tonnage (kg),Site,Documents\n");
            
            for (PickupRowDTO pickup : pickups) {
                csv.append(pickup.getDate()).append(",")
                   .append(pickup.getType()).append(",")
                   .append(pickup.getTonnageKg()).append(",")
                   .append(pickup.getSite()).append(",")
                   .append(pickup.getDocuments().size()).append("\n");
            }
            
            String filename = "enlevements.csv";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.valueOf("text/csv"))
                    .body(csv.toString().getBytes());
                    
        } catch (Exception e) {
            log.error("Erreur lors de l'export CSV: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
