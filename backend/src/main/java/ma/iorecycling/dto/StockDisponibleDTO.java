package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour un stock disponible à la vente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDisponibleDTO {
    
    private Long pickupItemId;
    private Long enlevementId;
    private String numeroEnlevement;
    private String dateEnlevement;
    private Long societeId;
    private String societeNom;
    private String typeDechet;
    private String sousType;
    private BigDecimal quantiteRecupereeKg;
    private BigDecimal quantiteVendueKg;
    private BigDecimal resteAVendreKg;
    private String statutStock; // NON_VENDU, PARTIELLEMENT_VENDU, VENDU
}

