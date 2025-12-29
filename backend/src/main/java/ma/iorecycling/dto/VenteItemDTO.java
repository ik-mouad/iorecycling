package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO pour l'entité VenteItem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteItemDTO {
    
    private Long id;
    private Long venteId;
    private Long pickupItemId;
    private String typeDechet;
    private String sousType;
    private BigDecimal quantiteVendueKg;
    private BigDecimal prixVenteUnitaireMad;
    private BigDecimal montantVenteMad;
    private Instant createdAt;
}

