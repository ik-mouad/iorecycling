package ma.iorecycling.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.entity.PickupType;
import ma.iorecycling.service.ClientContextService;
import ma.iorecycling.service.PickupQueryService;
import ma.iorecycling.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@Slf4j
public class ClientDashboardController {
    
    private final ClientContextService clientContextService;
    private final PickupQueryService pickupQueryService;
    private final ReportService reportService;
    
    /**
     * GET /api/client/pickups
     * Liste les enlèvements d'un client avec pagination et filtrage
     */
    @GetMapping("/pickups")
    public ResponseEntity<Page<ma.iorecycling.dto.PickupRowDTO>> getPickups(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        
        Long clientId = clientContextService.getClientId(jwt);
        log.info("Récupération des enlèvements pour client {} avec filtre {}", clientId, type);
        
        // Validation du type
        PickupType pickupType;
        try {
            pickupType = PickupType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Type d'enlèvement invalide: {}", type);
            return ResponseEntity.badRequest().build();
        }
        
        // Pagination avec tri par date décroissante
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        
        Page<ma.iorecycling.dto.PickupRowDTO> result = pickupQueryService.listPickups(clientId, pickupType, pageable);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * GET /api/client/valorisables/summary
     * Récupère le résumé de valorisation pour un mois donné
     */
    @GetMapping("/valorisables/summary")
    public ResponseEntity<ValorSummaryDTO> getValorSummary(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) 
            @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Format de mois invalide (YYYY-MM)") 
            String month) {
        
        Long clientId = clientContextService.getClientId(jwt);
        
        // Si pas de mois spécifié, utiliser le mois courant
        YearMonth targetMonth = month != null ? 
            YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM")) : 
            YearMonth.now();
        
        log.info("Récupération du résumé de valorisation pour client {} et mois {}", clientId, targetMonth);
        
        ValorSummaryDTO summary = pickupQueryService.valorSummary(clientId, targetMonth);
        
        return ResponseEntity.ok(summary);
    }
    
    /**
     * GET /api/client/report
     * Génère et télécharge un rapport PDF de valorisation
     */
    @GetMapping("/report")
    public ResponseEntity<byte[]> downloadReport(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) 
            @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Format de mois invalide (YYYY-MM)") 
            String month) {
        
        Long clientId = clientContextService.getClientId(jwt);
        
        // Si pas de mois spécifié, utiliser le mois courant
        YearMonth targetMonth = month != null ? 
            YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM")) : 
            YearMonth.now();
        
        log.info("Génération du rapport PDF pour client {} et mois {}", clientId, targetMonth);
        
        // Récupérer les données de valorisation
        ValorSummaryDTO summary = pickupQueryService.valorSummary(clientId, targetMonth);
        
        // Générer le PDF
        byte[] pdfContent = reportService.buildMonthlyValorPdf(clientId, targetMonth, summary);
        
        // Préparer les headers pour le téléchargement
        String filename = String.format("rapport-valorisation-%s.pdf", targetMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfContent.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}
