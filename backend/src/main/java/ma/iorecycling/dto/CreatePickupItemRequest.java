package ma.iorecycling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour créer un item d'enlèvement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePickupItemRequest {
    
    @NotBlank(message = "Le type de déchet est obligatoire")
    private String typeDechet;  // VALORISABLE, BANAL, A_ELIMINER
    
    private String sousType;  // Obligatoire si VALORISABLE
    
    @NotNull(message = "La quantité est obligatoire")
    @PositiveOrZero(message = "La quantité doit être positive ou zéro")
    private BigDecimal quantiteKg;
    
    private String uniteMesure;  // kg, L, m³, unité, etc. (optionnel, par défaut "kg")
    
    private String etat;  // vrac, compacté, broyé, Palettisé, autre (optionnel)
    
    @NotNull(message = "Le prix unitaire est obligatoire")
    @PositiveOrZero(message = "Le prix unitaire doit être positif ou zéro")
    private BigDecimal prixUnitaireMad;
}

