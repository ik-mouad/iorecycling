package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO pour la création d'un item de vente
 */
@Data
public class CreateVenteItemRequest {
    
    private Long pickupItemId; // Optionnel si regroupement
    
    @NotNull(message = "Le type de déchet est obligatoire")
    private String typeDechet;
    
    private String sousType;
    
    @NotNull(message = "La quantité vendue est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private BigDecimal quantiteVendueKg;
    
    @NotNull(message = "Le prix de vente unitaire est obligatoire")
    @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
    private BigDecimal prixVenteUnitaireMad;
}

