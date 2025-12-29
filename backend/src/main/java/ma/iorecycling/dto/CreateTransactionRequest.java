package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour créer une nouvelle transaction
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {
    
    @NotNull(message = "Le type de transaction est obligatoire")
    private Transaction.TypeTransaction type;
    
    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal montant;
    
    @NotNull(message = "La date est obligatoire")
    private LocalDate dateTransaction;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;
    
    @Size(max = 100, message = "La catégorie ne peut pas dépasser 100 caractères")
    private String categorie;
    
    @Size(max = 50, message = "Le numéro de référence ne peut pas dépasser 50 caractères")
    private String numeroReference;
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;
    
    private Long enlevementId;
    
    // Type de recette (PRESTATION ou VENTE_MATIERE) - uniquement pour les RECETTE
    private Transaction.TypeRecette typeRecette;
    
    @Size(max = 1000, message = "Les notes ne peuvent pas dépasser 1000 caractères")
    private String notes;
    
    // Échéances optionnelles
    private List<CreateEcheanceRequest> echeances;
}

