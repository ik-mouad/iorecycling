package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour une ligne du résumé de valorisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValorSummaryRowDTO {
    
    private String material;
    private BigDecimal qtyKg;
    private BigDecimal pricePerKg;
    private BigDecimal totalMad;
    
    /**
     * Crée un ValorSummaryRowDTO à partir des données agrégées
     */
    public static ValorSummaryRowDTO fromAggregatedData(String material, 
                                                       BigDecimal totalQty, 
                                                       BigDecimal avgPrice, 
                                                       BigDecimal totalMad) {
        return ValorSummaryRowDTO.builder()
                .material(material)
                .qtyKg(totalQty)
                .pricePerKg(avgPrice)
                .totalMad(totalMad)
                .build();
    }
}