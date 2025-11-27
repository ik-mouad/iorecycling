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
    private String typeDechet;  // VALORISABLE, BANAL, A_ELIMINER
    private String sousType;
    private BigDecimal quantiteKg;
    private BigDecimal prixUnitaireMad;
    private BigDecimal montantMad;
}

