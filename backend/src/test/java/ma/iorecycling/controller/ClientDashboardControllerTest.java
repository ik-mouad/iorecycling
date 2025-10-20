package ma.iorecycling.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.iorecycling.dto.ValorSummaryDTO;
import ma.iorecycling.service.ClientContextService;
import ma.iorecycling.service.PickupQueryService;
import ma.iorecycling.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientDashboardController.class)
class ClientDashboardControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private ClientContextService clientContextService;
    
    @MockBean
    private PickupQueryService pickupQueryService;
    
    @MockBean
    private ReportService reportService;
    
    @Test
    void getValorSummary_shouldReturnValidJson() throws Exception {
        // Given
        Long clientId = 1L;
        Jwt mockJwt = createMockJwt(clientId);
        
        ValorSummaryDTO mockSummary = new ValorSummaryDTO(
            "2024-01",
            Arrays.asList(
                new ma.iorecycling.dto.ValorSummaryRowDTO("CARTON", BigDecimal.valueOf(100.0), new BigDecimal("1.50"), new BigDecimal("150.00")),
                new ma.iorecycling.dto.ValorSummaryRowDTO("PLASTIQUE", BigDecimal.valueOf(50.0), new BigDecimal("2.00"), new BigDecimal("100.00"))
            ),
            new BigDecimal("250.00"),
            "MAD"
        );
        
        when(clientContextService.getClientId(any(Jwt.class))).thenReturn(clientId);
        when(pickupQueryService.valorSummary(eq(clientId), any(YearMonth.class))).thenReturn(mockSummary);
        
        // When & Then
        mockMvc.perform(get("/api/client/valorisables/summary?month=2024-01")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.month").value("2024-01"))
                .andExpect(jsonPath("$.currency").value("MAD"))
                .andExpect(jsonPath("$.grandTotalMad").value(250.00))
                .andExpect(jsonPath("$.rows").isArray())
                .andExpect(jsonPath("$.rows.length()").value(2))
                .andExpect(jsonPath("$.rows[0].material").value("CARTON"))
                .andExpect(jsonPath("$.rows[0].qtyKg").value(100.0))
                .andExpect(jsonPath("$.rows[0].pricePerKg").value(1.50))
                .andExpect(jsonPath("$.rows[0].totalMad").value(150.00));
    }
    
    @Test
    void getValorSummary_withInvalidMonth_shouldReturnBadRequest() throws Exception {
        // Given
        Long clientId = 1L;
        Jwt mockJwt = createMockJwt(clientId);
        
        when(clientContextService.getClientId(any(Jwt.class))).thenReturn(clientId);
        
        // When & Then
        mockMvc.perform(get("/api/client/valorisables/summary?month=invalid")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void getPickups_shouldReturnPaginatedResults() throws Exception {
        // Given
        Long clientId = 1L;
        Jwt mockJwt = createMockJwt(clientId);
        
        Page<ma.iorecycling.dto.PickupRowDTO> mockPage = new PageImpl<>(
            Collections.emptyList(),
            PageRequest.of(0, 10),
            0
        );
        
        when(clientContextService.getClientId(any(Jwt.class))).thenReturn(clientId);
        when(pickupQueryService.listPickups(eq(clientId), any(), any())).thenReturn(mockPage);
        
        // When & Then
        mockMvc.perform(get("/api/client/pickups?page=0&size=10")
                .with(jwt().jwt(mockJwt))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.number").value(0));
    }
    
    @Test
    void downloadReport_shouldReturnPdf() throws Exception {
        // Given
        Long clientId = 1L;
        Jwt mockJwt = createMockJwt(clientId);
        
        byte[] mockPdfContent = "Mock PDF Content".getBytes();
        ValorSummaryDTO mockSummary = new ValorSummaryDTO(
            "2024-01",
            Collections.emptyList(),
            BigDecimal.ZERO,
            "MAD"
        );
        
        when(clientContextService.getClientId(any(Jwt.class))).thenReturn(clientId);
        when(pickupQueryService.valorSummary(eq(clientId), any(YearMonth.class))).thenReturn(mockSummary);
        when(reportService.buildMonthlyValorPdf(eq(clientId), any(YearMonth.class), eq(mockSummary)))
            .thenReturn(mockPdfContent);
        
        // When & Then
        mockMvc.perform(get("/api/client/report?month=2024-01")
                .with(jwt().jwt(mockJwt)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"rapport-valorisation-2024-01.pdf\""))
                .andExpect(content().bytes(mockPdfContent));
    }
    
    @Test
    void downloadReport_withInvalidMonth_shouldReturnBadRequest() throws Exception {
        // Given
        Long clientId = 1L;
        Jwt mockJwt = createMockJwt(clientId);
        
        when(clientContextService.getClientId(any(Jwt.class))).thenReturn(clientId);
        
        // When & Then
        mockMvc.perform(get("/api/client/report?month=invalid")
                .with(jwt().jwt(mockJwt)))
                .andExpect(status().isBadRequest());
    }
    
    private Jwt createMockJwt(Long clientId) {
        return Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("clientId", clientId)
                .claim("realm_access", Collections.singletonMap("roles", Arrays.asList("CLIENT")))
                .build();
    }
}
