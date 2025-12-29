package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Paiement;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour créer un nouveau paiement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaiementRequest {
    
    @NotNull(message = "La transaction est obligatoire")
    private Long transactionId;
    
    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal montant;
    
    @NotNull(message = "La date de paiement est obligatoire")
    private LocalDate datePaiement;
    
    @NotNull(message = "Le mode de paiement est obligatoire")
    private Paiement.ModePaiement modePaiement;
    
    @Size(max = 100, message = "La référence ne peut pas dépasser 100 caractères")
    private String reference;
    
    @Size(max = 500, message = "Les notes ne peuvent pas dépasser 500 caractères")
    private String notes;
}

