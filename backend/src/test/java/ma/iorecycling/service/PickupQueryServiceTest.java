package ma.iorecycling.service;

import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.dto.ValorSummaryRowDTO;
import ma.iorecycling.entity.PickupItem;
import ma.iorecycling.entity.PickupType;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.PickupRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PickupQueryServiceTest {
    
    @Mock
    private PickupRepository pickupRepository;
    
    @Mock
    private PickupItemRepository pickupItemRepository;
    
    @InjectMocks
    private PickupQueryService pickupQueryService;
    
    private List<PickupItem> mockItems;
    
    @BeforeEach
    void setUp() {
        // Données de test : CARTON 100kg@1.5, PLASTIQUE 50kg@2.0
        PickupItem cartonItem = new PickupItem();
        cartonItem.setMaterial("CARTON");
        cartonItem.setQtyKg(new BigDecimal("100.00"));
        cartonItem.setPriceMadPerKg(new BigDecimal("1.50"));
        
        PickupItem plastiqueItem = new PickupItem();
        plastiqueItem.setMaterial("PLASTIQUE");
        plastiqueItem.setQtyKg(new BigDecimal("50.00"));
        plastiqueItem.setPriceMadPerKg(new BigDecimal("2.00"));
        
        mockItems = Arrays.asList(cartonItem, plastiqueItem);
    }
    
    @Test
    void valorSummary_shouldCalculateCorrectTotals() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        when(pickupItemRepository.findByPickupClientIdAndPickupDateBetweenAndPickupType(
            eq(clientId), any(), any(), eq(PickupType.RECYCLABLE)
        )).thenReturn(mockItems);
        
        // When
        ValorSummaryDTO result = pickupQueryService.valorSummary(clientId, month);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo("2024-01");
        assertThat(result.getCurrency()).isEqualTo("MAD");
        assertThat(result.getRows()).hasSize(2);
        
        // Vérifier les calculs
        ValorSummaryRowDTO cartonRow = result.getRows().stream()
            .filter(row -> "CARTON".equals(row.getMaterial()))
            .findFirst()
            .orElseThrow();
        
        assertThat(cartonRow.getQtyKg()).isEqualTo(100.0);
        assertThat(cartonRow.getPricePerKg()).isEqualTo(new BigDecimal("1.50"));
        assertThat(cartonRow.getTotalMad()).isEqualTo(new BigDecimal("150.00"));
        
        ValorSummaryRowDTO plastiqueRow = result.getRows().stream()
            .filter(row -> "PLASTIQUE".equals(row.getMaterial()))
            .findFirst()
            .orElseThrow();
        
        assertThat(plastiqueRow.getQtyKg()).isEqualTo(50.0);
        assertThat(plastiqueRow.getPricePerKg()).isEqualTo(new BigDecimal("2.00"));
        assertThat(plastiqueRow.getTotalMad()).isEqualTo(new BigDecimal("100.00"));
        
        // Total général : 150 + 100 = 250
        assertThat(result.getGrandTotalMad()).isEqualTo(new BigDecimal("250.00"));
    }
    
    @Test
    void valorSummary_withEmptyData_shouldReturnEmptyResult() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        when(pickupItemRepository.findByPickupClientIdAndPickupDateBetweenAndPickupType(
            eq(clientId), any(), any(), eq(PickupType.RECYCLABLE)
        )).thenReturn(Arrays.asList());
        
        // When
        ValorSummaryDTO result = pickupQueryService.valorSummary(clientId, month);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRows()).isEmpty();
        assertThat(result.getGrandTotalMad()).isEqualTo(BigDecimal.ZERO);
    }
}
