package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour l'entité PickupItem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupItemDTO {
    
    private Long id;
    private Long enlevementId;
    private String typeDechet;  // RECYCLABLE, BANAL, A_DETRUIRE
    private String sousType;
    private BigDecimal quantiteKg;
    private String uniteMesure;  // kg, L, m³, unité, etc.
    private String etat;  // vrac, compacté, broyé, Palettisé, autre
    private BigDecimal prixUnitaireMad;
    private BigDecimal montantMad;
}

