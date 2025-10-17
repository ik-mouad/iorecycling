package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValorSummaryDTO {
    
    private String month;
    private List<ValorSummaryRowDTO> rows;
    private BigDecimal grandTotalMad;
    private String currency = "MAD";
}
