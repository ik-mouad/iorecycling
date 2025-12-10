package ma.iorecycling.service;

import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.dto.ValorSummaryRowDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {
    
    @InjectMocks
    private ReportService reportService;
    
    @Test
    void buildMonthlyValorPdf_shouldGenerateValidPdf() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        ValorSummaryDTO summary = new ValorSummaryDTO(
            "2024-01",
            Arrays.asList(
                new ValorSummaryRowDTO("CARTON", BigDecimal.valueOf(100.0), new BigDecimal("1.50"), new BigDecimal("150.00")),
                new ValorSummaryRowDTO("PLASTIQUE", BigDecimal.valueOf(50.0), new BigDecimal("2.00"), new BigDecimal("100.00"))
            ),
            new BigDecimal("250.00"),
            "MAD"
        );
        
        // When
        byte[] pdfContent = reportService.buildMonthlyValorPdf(clientId, month, summary);
        
        // Then
        assertThat(pdfContent).isNotNull();
        assertThat(pdfContent.length).isGreaterThan(0);
        
        // Vérifier que c'est bien un PDF (commence par %PDF)
        String pdfHeader = new String(pdfContent, 0, Math.min(4, pdfContent.length));
        assertThat(pdfHeader).isEqualTo("%PDF");
    }
    
    @Test
    void buildMonthlyValorPdf_withEmptyData_shouldGenerateValidPdf() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        ValorSummaryDTO summary = new ValorSummaryDTO(
            "2024-01",
            Arrays.asList(),
            BigDecimal.ZERO,
            "MAD"
        );
        
        // When
        byte[] pdfContent = reportService.buildMonthlyValorPdf(clientId, month, summary);
        
        // Then
        assertThat(pdfContent).isNotNull();
        assertThat(pdfContent.length).isGreaterThan(0);
        
        // Vérifier que c'est bien un PDF
        String pdfHeader = new String(pdfContent, 0, Math.min(4, pdfContent.length));
        assertThat(pdfHeader).isEqualTo("%PDF");
    }
}
