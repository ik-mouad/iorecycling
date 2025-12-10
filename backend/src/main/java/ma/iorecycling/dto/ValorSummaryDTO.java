package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour le résumé de valorisation mensuel
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValorSummaryDTO {
    
    private String month; // Format YYYY-MM
    private List<ValorSummaryRowDTO> rows;
    private BigDecimal grandTotalMad;
    private String currency;
    
    /**
     * Crée un ValorSummaryDTO vide pour un mois donné
     */
    public static ValorSummaryDTO emptyForMonth(String month) {
        return ValorSummaryDTO.builder()
                .month(month)
                .rows(List.of())
                .grandTotalMad(BigDecimal.ZERO)
                .currency("MAD")
                .build();
    }
}