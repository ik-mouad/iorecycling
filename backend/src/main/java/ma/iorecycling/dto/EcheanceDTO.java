package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Echeance;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO pour l'entité Echeance
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EcheanceDTO {
    
    private Long id;
    private Long transactionId;
    private BigDecimal montant;
    private LocalDate dateEcheance;
    private Echeance.StatutEcheance statut;
    
    // Métadonnées
    private Instant createdAt;
    private Instant updatedAt;
}

