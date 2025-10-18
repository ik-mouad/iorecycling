package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DocDTO;
import ma.iorecycling.dto.PickupRowDTO;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.*;
import ma.iorecycling.service.StorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion administrative des enlèvements
 */
@RestController
@RequestMapping("/api/admin/pickups")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Pickups", description = "API pour la gestion administrative des enlèvements")
public class AdminPickupController {
    
    private final PickupRepository pickupRepository;
    private final ClientRepository clientRepository;
    private final SiteRepository siteRepository;
    private final DocumentRepository documentRepository;
    private final PickupItemRepository pickupItemRepository;
    private final StorageService storageService;
    
    /**
     * Liste tous les enlèvements avec filtres
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Liste des enlèvements", description = "Récupère la liste paginée de tous les enlèvements avec filtres")
    public ResponseEntity<Page<PickupRowDTO>> listPickups(
            @Parameter(description = "ID du client") @RequestParam(required = false) Long clientId,
            @Parameter(description = "Type d'enlèvement") @RequestParam(required = false) PickupType type,
            @Parameter(description = "ID du site") @RequestParam(required = false) Long siteId,
            @Parameter(description = "Date de début") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @Parameter(description = "Date de fin") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "20") int size) {
        
        log.debug("Récupération des enlèvements avec filtres: clientId={}, type={}, siteId={}", clientId, type, siteId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<Pickup> pickups = pickupRepository.findAll(pageable); // TODO: Implémenter les filtres
        
        Page<PickupRowDTO> result = pickups.map(pickup -> {
            List<DocDTO> documents = pickup.getDocuments().stream()
                    .map(doc -> DocDTO.fromDocument(doc, storageService.getPresignedUrl(doc.getObjectKey())))
                    .collect(Collectors.toList());
            return PickupRowDTO.fromPickup(pickup, documents);
        });
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Crée un nouvel enlèvement
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un enlèvement", description = "Crée un nouvel enlèvement")
    public ResponseEntity<PickupRowDTO> createPickup(@Valid @RequestBody CreatePickupRequest request) {
        log.debug("Création d'un nouvel enlèvement pour client {}", request.getClientId());
        
        try {
            // Vérifier que le client existe
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client non trouvé"));
            
            // Vérifier que le site existe (si fourni)
            Site site = null;
            if (request.getSiteId() != null) {
                site = siteRepository.findById(request.getSiteId())
                        .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
            }
            
            // Créer l'enlèvement
            Pickup pickup = Pickup.builder()
                    .client(client)
                    .date(request.getDate())
                    .type(request.getType())
                    .site(site)
                    .kgValorisables(request.getKgValorisables())
                    .kgBanals(request.getKgBanals())
                    .kgDangereux(request.getKgDangereux())
                    .build();
            
            pickup = pickupRepository.save(pickup);
            
            // Ajouter les items si c'est un enlèvement recyclable
            if (request.getType() == PickupType.RECYCLABLE && request.getItems() != null) {
                for (CreatePickupRequest.PickupItemRequest itemRequest : request.getItems()) {
                    PickupItem item = PickupItem.builder()
                            .pickupId(pickup.getId())
                            .material(itemRequest.getMaterial())
                            .qtyKg(itemRequest.getQtyKg())
                            .priceMadPerKg(itemRequest.getPriceMadPerKg())
                            .build();
                    pickupItemRepository.save(item);
                }
            }
            
            // Recharger avec les associations
            pickup = pickupRepository.findById(pickup.getId()).orElse(pickup);
            
            List<DocDTO> documents = pickup.getDocuments().stream()
                    .map(doc -> DocDTO.fromDocument(doc, storageService.getPresignedUrl(doc.getObjectKey())))
                    .collect(Collectors.toList());
            
            PickupRowDTO result = PickupRowDTO.fromPickup(pickup, documents);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'enlèvement: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Met à jour un enlèvement existant
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un enlèvement", description = "Met à jour un enlèvement existant")
    public ResponseEntity<PickupRowDTO> updatePickup(
            @PathVariable Long id, 
            @Valid @RequestBody CreatePickupRequest request) {
        
        log.debug("Mise à jour de l'enlèvement {}", id);
        
        try {
            Pickup pickup = pickupRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé"));
            
            // Mettre à jour les champs
            pickup.setDate(request.getDate());
            pickup.setType(request.getType());
            pickup.setKgValorisables(request.getKgValorisables());
            pickup.setKgBanals(request.getKgBanals());
            pickup.setKgDangereux(request.getKgDangereux());
            
            if (request.getSiteId() != null) {
                Site site = siteRepository.findById(request.getSiteId())
                        .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
                pickup.setSite(site);
            }
            
            pickup = pickupRepository.save(pickup);
            
            // Mettre à jour les items si nécessaire
            if (request.getType() == PickupType.RECYCLABLE && request.getItems() != null) {
                // Supprimer les anciens items
                pickupItemRepository.deleteByPickupId(id);
                
                // Ajouter les nouveaux items
                for (CreatePickupRequest.PickupItemRequest itemRequest : request.getItems()) {
                    PickupItem item = PickupItem.builder()
                            .pickupId(id)
                            .material(itemRequest.getMaterial())
                            .qtyKg(itemRequest.getQtyKg())
                            .priceMadPerKg(itemRequest.getPriceMadPerKg())
                            .build();
                    pickupItemRepository.save(item);
                }
            }
            
            // Recharger avec les associations
            pickup = pickupRepository.findById(id).orElse(pickup);
            
            List<DocDTO> documents = pickup.getDocuments().stream()
                    .map(doc -> DocDTO.fromDocument(doc, storageService.getPresignedUrl(doc.getObjectKey())))
                    .collect(Collectors.toList());
            
            PickupRowDTO result = PickupRowDTO.fromPickup(pickup, documents);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de l'enlèvement: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Liste les documents d'un enlèvement
     */
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Documents d'un enlèvement", description = "Récupère la liste des documents d'un enlèvement")
    public ResponseEntity<List<DocDTO>> getPickupDocuments(@PathVariable Long id) {
        log.debug("Récupération des documents pour l'enlèvement {}", id);
        
        List<Document> documents = documentRepository.findByPickupIdOrderByCreatedAtDesc(id);
        
        List<DocDTO> result = documents.stream()
                .map(doc -> DocDTO.fromDocument(doc, storageService.getPresignedUrl(doc.getObjectKey())))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Upload un document pour un enlèvement
     */
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Uploader un document", description = "Upload un document pour un enlèvement")
    public ResponseEntity<DocDTO> uploadDocument(
            @PathVariable Long id,
            @RequestParam("docType") Document.DocumentType docType,
            @RequestParam("file") MultipartFile file) {
        
        log.debug("Upload d'un document {} pour l'enlèvement {}", docType, id);
        
        try {
            // Vérifier que l'enlèvement existe
            Pickup pickup = pickupRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé"));
            
            // Upload vers MinIO
            String objectKey = storageService.put(
                    pickup.getClient().getId(),
                    id,
                    docType.name(),
                    file.getOriginalFilename(),
                    file.getInputStream(),
                    file.getContentType()
            );
            
            // Sauvegarder en base
            Document document = Document.builder()
                    .pickupId(id)
                    .docType(docType)
                    .filename(file.getOriginalFilename())
                    .objectKey(objectKey)
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .createdBy("admin") // TODO: Récupérer depuis le contexte
                    .build();
            
            document = documentRepository.save(document);
            
            DocDTO result = DocDTO.fromDocument(document, storageService.getPresignedUrl(objectKey));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (IOException e) {
            log.error("Erreur lors de l'upload du document: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erreur lors de l'upload du document: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * DTO pour la création/mise à jour d'un enlèvement
     */
    public static class CreatePickupRequest {
        private Long clientId;
        private LocalDate date;
        private PickupType type;
        private Long siteId;
        private Double kgValorisables;
        private Double kgBanals;
        private Double kgDangereux;
        private List<PickupItemRequest> items;
        
        // Getters et setters
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public PickupType getType() { return type; }
        public void setType(PickupType type) { this.type = type; }
        
        public Long getSiteId() { return siteId; }
        public void setSiteId(Long siteId) { this.siteId = siteId; }
        
        public Double getKgValorisables() { return kgValorisables; }
        public void setKgValorisables(Double kgValorisables) { this.kgValorisables = kgValorisables; }
        
        public Double getKgBanals() { return kgBanals; }
        public void setKgBanals(Double kgBanals) { this.kgBanals = kgBanals; }
        
        public Double getKgDangereux() { return kgDangereux; }
        public void setKgDangereux(Double kgDangereux) { this.kgDangereux = kgDangereux; }
        
        public List<PickupItemRequest> getItems() { return items; }
        public void setItems(List<PickupItemRequest> items) { this.items = items; }
        
        public static class PickupItemRequest {
            private String material;
            private java.math.BigDecimal qtyKg;
            private java.math.BigDecimal priceMadPerKg;
            
            // Getters et setters
            public String getMaterial() { return material; }
            public void setMaterial(String material) { this.material = material; }
            
            public java.math.BigDecimal getQtyKg() { return qtyKg; }
            public void setQtyKg(java.math.BigDecimal qtyKg) { this.qtyKg = qtyKg; }
            
            public java.math.BigDecimal getPriceMadPerKg() { return priceMadPerKg; }
            public void setPriceMadPerKg(java.math.BigDecimal priceMadPerKg) { this.priceMadPerKg = priceMadPerKg; }
        }
    }
}
