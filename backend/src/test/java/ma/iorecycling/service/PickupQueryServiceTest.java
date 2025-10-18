package ma.iorecycling.service;

import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.dto.ValorSummaryRowDTO;
import ma.iorecycling.entity.Pickup;
import ma.iorecycling.entity.PickupItem;
import ma.iorecycling.entity.PickupType;
import ma.iorecycling.entity.Client;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.PickupRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Tests unitaires pour PickupQueryService
 */
@ExtendWith(MockitoExtension.class)
class PickupQueryServiceTest {
    
    @Mock
    private PickupRepository pickupRepository;
    
    @Mock
    private PickupItemRepository pickupItemRepository;
    
    @InjectMocks
    private PickupQueryService pickupQueryService;
    
    private Client testClient;
    private Pickup testPickup;
    private List<PickupItem> testItems;
    
    @BeforeEach
    void setUp() {
        testClient = new Client();
        testClient.setId(1L);
        testClient.setName("Test Client");
        
        testPickup = new Pickup();
        testPickup.setId(1L);
        testPickup.setClient(testClient);
        testPickup.setDate(LocalDate.of(2024, 1, 15));
        testPickup.setType(PickupType.RECYCLABLE);
        
        testItems = Arrays.asList(
                createPickupItem(1L, "Papier", new BigDecimal("100.5"), new BigDecimal("2.5")),
                createPickupItem(2L, "Carton", new BigDecimal("200.0"), new BigDecimal("1.8")),
                createPickupItem(3L, "Plastique", new BigDecimal("75.2"), new BigDecimal("4.2"))
        );
    }
    
    @Test
    void valorSummary_shouldCalculateCorrectTotals() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        when(pickupItemRepository.findMaterialSummaryForMonth(clientId, 2024, 1))
                .thenReturn(Arrays.asList(
                        new Object[]{"Papier", new BigDecimal("100.5"), new BigDecimal("2.5"), new BigDecimal("251.25")},
                        new Object[]{"Carton", new BigDecimal("200.0"), new BigDecimal("1.8"), new BigDecimal("360.00")},
                        new Object[]{"Plastique", new BigDecimal("75.2"), new BigDecimal("4.2"), new BigDecimal("315.84")}
                ));
        
        // When
        ValorSummaryDTO result = pickupQueryService.valorSummary(clientId, month);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo("2024-01");
        assertThat(result.getCurrency()).isEqualTo("MAD");
        assertThat(result.getRows()).hasSize(3);
        assertThat(result.getGrandTotalMad()).isEqualByComparingTo(new BigDecimal("927.09"));
        
        // Vérifier les détails des matériaux
        ValorSummaryRowDTO papierRow = result.getRows().stream()
                .filter(row -> "Papier".equals(row.getMaterial()))
                .findFirst().orElse(null);
        assertThat(papierRow).isNotNull();
        assertThat(papierRow.getQtyKg()).isEqualByComparingTo(new BigDecimal("100.5"));
        assertThat(papierRow.getPricePerKg()).isEqualByComparingTo(new BigDecimal("2.5"));
        assertThat(papierRow.getTotalMad()).isEqualByComparingTo(new BigDecimal("251.25"));
    }
    
    @Test
    void valorSummary_shouldReturnEmptyForNoData() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        when(pickupItemRepository.findMaterialSummaryForMonth(clientId, 2024, 1))
                .thenReturn(Arrays.asList());
        
        // When
        ValorSummaryDTO result = pickupQueryService.valorSummary(clientId, month);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo("2024-01");
        assertThat(result.getCurrency()).isEqualTo("MAD");
        assertThat(result.getRows()).isEmpty();
        assertThat(result.getGrandTotalMad()).isEqualByComparingTo(BigDecimal.ZERO);
    }
    
    @Test
    void valorSummary_shouldHandleNullValues() {
        // Given
        Long clientId = 1L;
        YearMonth month = YearMonth.of(2024, 1);
        
        when(pickupItemRepository.findMaterialSummaryForMonth(clientId, 2024, 1))
                .thenReturn(Arrays.asList(
                        new Object[]{"Papier", new BigDecimal("100.5"), new BigDecimal("2.5"), new BigDecimal("251.25")},
                        new Object[]{"Carton", null, new BigDecimal("1.8"), new BigDecimal("360.00")}
                ));
        
        // When
        ValorSummaryDTO result = pickupQueryService.valorSummary(clientId, month);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRows()).hasSize(2);
        assertThat(result.getGrandTotalMad()).isEqualByComparingTo(new BigDecimal("611.25"));
    }
    
    private PickupItem createPickupItem(Long id, String material, BigDecimal qty, BigDecimal price) {
        PickupItem item = new PickupItem();
        item.setId(id);
        item.setMaterial(material);
        item.setQtyKg(qty);
        item.setPriceMadPerKg(price);
        item.setTotalMad(qty.multiply(price));
        return item;
    }
}