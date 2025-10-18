package ma.iorecycling.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.iorecycling.entity.Client;
import ma.iorecycling.entity.Pickup;
import ma.iorecycling.entity.PickupType;
import ma.iorecycling.entity.Site;
import ma.iorecycling.repository.*;
import ma.iorecycling.service.StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests WebMvc pour AdminPickupController
 */
@WebMvcTest(AdminPickupController.class)
class AdminPickupControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private PickupRepository pickupRepository;
    
    @MockBean
    private ClientRepository clientRepository;
    
    @MockBean
    private SiteRepository siteRepository;
    
    @MockBean
    private DocumentRepository documentRepository;
    
    @MockBean
    private PickupItemRepository pickupItemRepository;
    
    @MockBean
    private StorageService storageService;
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void createPickup_shouldReturnCreatedPickup() throws Exception {
        // Given
        Client client = new Client();
        client.setId(1L);
        client.setName("Test Client");
        
        Site site = new Site();
        site.setId(1L);
        site.setName("Site Principal");
        
        Pickup savedPickup = new Pickup();
        savedPickup.setId(1L);
        savedPickup.setClient(client);
        savedPickup.setDate(LocalDate.of(2024, 1, 15));
        savedPickup.setType(PickupType.RECYCLABLE);
        savedPickup.setSite(site);
        savedPickup.setKgValorisables(100.0);
        savedPickup.setKgBanals(50.0);
        savedPickup.setKgDangereux(10.0);
        
        AdminPickupController.CreatePickupRequest request = new AdminPickupController.CreatePickupRequest();
        request.setClientId(1L);
        request.setDate(LocalDate.of(2024, 1, 15));
        request.setType(PickupType.RECYCLABLE);
        request.setSiteId(1L);
        request.setKgValorisables(100.0);
        request.setKgBanals(50.0);
        request.setKgDangereux(10.0);
        
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(pickupRepository.save(any(Pickup.class))).thenReturn(savedPickup);
        when(pickupRepository.findById(1L)).thenReturn(Optional.of(savedPickup));
        
        // When & Then
        mockMvc.perform(post("/api/admin/pickups")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("Recyclable"))
                .andExpect(jsonPath("$.site").value("Site Principal"));
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void createPickup_withInvalidClient_shouldReturnBadRequest() throws Exception {
        // Given
        AdminPickupController.CreatePickupRequest request = new AdminPickupController.CreatePickupRequest();
        request.setClientId(999L);
        request.setDate(LocalDate.of(2024, 1, 15));
        request.setType(PickupType.BANAL);
        
        when(clientRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        mockMvc.perform(post("/api/admin/pickups")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadDocument_shouldReturnCreatedDocument() throws Exception {
        // Given
        Pickup pickup = new Pickup();
        pickup.setId(1L);
        Client client = new Client();
        client.setId(1L);
        pickup.setClient(client);
        
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.pdf",
                "application/pdf",
                "Test PDF content".getBytes()
        );
        
        when(pickupRepository.findById(1L)).thenReturn(Optional.of(pickup));
        when(storageService.put(anyLong(), anyLong(), anyString(), anyString(), any(), anyString()))
                .thenReturn("client/1/pickup/1/bordereau-uuid-test-document.pdf");
        when(storageService.getPresignedUrl(anyString()))
                .thenReturn("http://minio:9000/presigned-url");
        when(documentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When & Then
        mockMvc.perform(multipart("/api/admin/pickups/1/documents")
                        .file(file)
                        .param("docType", "BORDEREAU")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("test-document.pdf"))
                .andExpect(jsonPath("$.type").value("BORDEREAU"))
                .andExpect(jsonPath("$.url").isNotEmpty());
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadDocument_withInvalidPickup_shouldReturnBadRequest() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.pdf",
                "application/pdf",
                "Test PDF content".getBytes()
        );
        
        when(pickupRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        mockMvc.perform(multipart("/api/admin/pickups/999/documents")
                        .file(file)
                        .param("docType", "BORDEREAU")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @WithMockUser(roles = "CLIENT")
    void createPickup_withoutAdminRole_shouldReturnForbidden() throws Exception {
        // Given
        AdminPickupController.CreatePickupRequest request = new AdminPickupController.CreatePickupRequest();
        request.setClientId(1L);
        request.setDate(LocalDate.of(2024, 1, 15));
        request.setType(PickupType.BANAL);
        
        // When & Then
        mockMvc.perform(post("/api/admin/pickups")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
