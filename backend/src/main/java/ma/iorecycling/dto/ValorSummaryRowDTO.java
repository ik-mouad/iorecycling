package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValorSummaryRowDTO {
    
    private String material;
    private Double qtyKg;
    private BigDecimal pricePerKg;
    private BigDecimal totalMad;
}
