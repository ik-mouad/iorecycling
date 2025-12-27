package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Paiement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO pour l'entité Paiement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaiementDTO {
    
    private Long id;
    private Long transactionId;
    private BigDecimal montant;
    private LocalDate datePaiement;
    private Paiement.ModePaiement modePaiement;
    private String reference;
    private String notes;
    private Paiement.StatutPaiement statut;
    
    // Métadonnées
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

