package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour mettre à jour une transaction
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTransactionRequest {
    
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal montant;
    
    private LocalDate dateTransaction;
    
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;
    
    @Size(max = 100, message = "La catégorie ne peut pas dépasser 100 caractères")
    private String categorie;
    
    @Size(max = 50, message = "Le numéro de référence ne peut pas dépasser 50 caractères")
    private String numeroReference;
    
    @Size(max = 1000, message = "Les notes ne peuvent pas dépasser 1000 caractères")
    private String notes;
    
    private Transaction.StatutTransaction statut;
}

