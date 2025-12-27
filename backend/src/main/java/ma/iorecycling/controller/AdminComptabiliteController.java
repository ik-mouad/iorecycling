package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.Transaction;
import ma.iorecycling.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller REST pour la gestion administrative de la comptabilité
 */
@RestController
@RequestMapping("/api/comptabilite")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Comptabilité", description = "API pour la gestion de la comptabilité")
@PreAuthorize("hasRole('COMPTABLE')")
public class AdminComptabiliteController {
    
    private final TransactionService transactionService;
    private final PaiementService paiementService;
    private final EcheanceService echeanceService;
    private final ComptabiliteDashboardService dashboardService;
    
    // ========== TRANSACTIONS ==========
    
    /**
     * Crée une nouvelle transaction
     */
    @PostMapping("/transactions")
    @Operation(summary = "Créer une transaction", description = "Crée une nouvelle transaction comptable")
    public ResponseEntity<TransactionDTO> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/comptabilite/transactions - Création transaction pour société {}", 
                request.getSocieteId());
        
        try {
            String createdBy = jwt.getSubject();
            TransactionDTO dto = transactionService.createTransaction(request, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la création de la transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste les transactions d'une société
     */
    @GetMapping("/transactions")
    @Operation(summary = "Liste les transactions", description = "Liste les transactions avec filtres optionnels")
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            @RequestParam Long societeId,
            @RequestParam(required = false) Transaction.TypeTransaction type,
            @PageableDefault(sort = "dateTransaction", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("GET /api/admin/comptabilite/transactions - Société: {}, Type: {}", societeId, type);
        
        try {
            Page<TransactionDTO> transactions = transactionService.getTransactionsBySociete(
                    societeId, type, pageable);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupère une transaction par ID
     */
    @GetMapping("/transactions/{id}")
    @Operation(summary = "Récupère une transaction", description = "Récupère les détails d'une transaction")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable Long id) {
        log.info("GET /api/admin/comptabilite/transactions/{}", id);
        
        try {
            TransactionDTO dto = transactionService.getTransactionById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la transaction {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Met à jour une transaction
     */
    @PutMapping("/transactions/{id}")
    @Operation(summary = "Met à jour une transaction", description = "Met à jour une transaction existante")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequest request) {
        
        log.info("PUT /api/admin/comptabilite/transactions/{}", id);
        
        try {
            TransactionDTO dto = transactionService.updateTransaction(id, request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de la transaction {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Supprime une transaction
     */
    @DeleteMapping("/transactions/{id}")
    @Operation(summary = "Supprime une transaction", description = "Supprime une transaction")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        log.info("DELETE /api/admin/comptabilite/transactions/{}", id);
        
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de la transaction {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste les transactions impayées d'une société
     */
    @GetMapping("/transactions/impayees")
    @Operation(summary = "Liste les transactions impayées", description = "Liste les transactions impayées d'une société")
    public ResponseEntity<List<TransactionDTO>> getTransactionsImpayees(@RequestParam Long societeId) {
        log.info("GET /api/admin/comptabilite/transactions/impayees - Société: {}", societeId);
        
        try {
            List<TransactionDTO> transactions = transactionService.getTransactionsImpayees(societeId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des transactions impayées", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== PAIEMENTS ==========
    
    /**
     * Crée un nouveau paiement
     */
    @PostMapping("/paiements")
    @Operation(summary = "Créer un paiement", description = "Crée un nouveau paiement")
    public ResponseEntity<PaiementDTO> createPaiement(
            @Valid @RequestBody CreatePaiementRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/comptabilite/paiements - Transaction: {}", request.getTransactionId());
        
        try {
            String createdBy = jwt.getSubject();
            PaiementDTO dto = paiementService.createPaiement(request, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            log.error("Erreur lors de la création du paiement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste les paiements d'une société
     */
    @GetMapping("/paiements")
    @Operation(summary = "Liste les paiements", description = "Liste les paiements d'une société")
    public ResponseEntity<Page<PaiementDTO>> getPaiements(
            @RequestParam Long societeId,
            @PageableDefault(sort = "datePaiement", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("GET /api/admin/comptabilite/paiements - Société: {}", societeId);
        
        try {
            Page<PaiementDTO> paiements = paiementService.getPaiementsBySociete(societeId, pageable);
            return ResponseEntity.ok(paiements);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des paiements", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Supprime un paiement
     */
    @DeleteMapping("/paiements/{id}")
    @Operation(summary = "Supprime un paiement", description = "Supprime un paiement")
    public ResponseEntity<Void> deletePaiement(@PathVariable Long id) {
        log.info("DELETE /api/admin/comptabilite/paiements/{}", id);
        
        try {
            paiementService.deletePaiement(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du paiement {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== ÉCHÉANCES ==========
    
    /**
     * Liste les échéances en retard d'une société
     */
    @GetMapping("/echeances/retard")
    @Operation(summary = "Liste les échéances en retard", description = "Liste les échéances en retard")
    public ResponseEntity<List<EcheanceDTO>> getEcheancesEnRetard(@RequestParam Long societeId) {
        log.info("GET /api/admin/comptabilite/echeances/retard - Société: {}", societeId);
        
        try {
            List<EcheanceDTO> echeances = echeanceService.getEcheancesEnRetard(societeId);
            return ResponseEntity.ok(echeances);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des échéances en retard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Liste les échéances à venir d'une société
     */
    @GetMapping("/echeances/avenir")
    @Operation(summary = "Liste les échéances à venir", description = "Liste les échéances à venir")
    public ResponseEntity<List<EcheanceDTO>> getEcheancesAVenir(
            @RequestParam Long societeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        
        log.info("GET /api/admin/comptabilite/echeances/avenir - Société: {}", societeId);
        
        try {
            List<EcheanceDTO> echeances = echeanceService.getEcheancesAVenir(societeId, dateDebut, dateFin);
            return ResponseEntity.ok(echeances);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des échéances à venir", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Marque une échéance comme payée
     */
    @PutMapping("/echeances/{id}/payer")
    @Operation(summary = "Marque une échéance comme payée", description = "Marque une échéance comme payée")
    public ResponseEntity<EcheanceDTO> marquerEcheancePayee(@PathVariable Long id) {
        log.info("PUT /api/admin/comptabilite/echeances/{}/payer", id);
        
        try {
            EcheanceDTO dto = echeanceService.marquerEcheancePayee(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Erreur lors du marquage de l'échéance {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ========== DASHBOARD ==========
    
    /**
     * Récupère le dashboard de comptabilité
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard comptabilité", description = "Récupère les KPIs du dashboard de comptabilité")
    public ResponseEntity<ComptabiliteDashboardDTO> getDashboard(
            @RequestParam Long societeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "mensuel") String periode) {
        
        log.info("GET /api/admin/comptabilite/dashboard - Société: {}, Période: {} - {}", 
                societeId, dateDebut, dateFin);
        
        try {
            ComptabiliteDashboardDTO dashboard = dashboardService.calculateDashboard(
                    societeId, dateDebut, dateFin, periode);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("Erreur lors du calcul du dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

