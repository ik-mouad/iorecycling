package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DocumentDTO;
import ma.iorecycling.entity.Document;
import ma.iorecycling.entity.Document.TypeDocument;
import ma.iorecycling.entity.Enlevement;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.DocumentRepository;
import ma.iorecycling.repository.EnlevementRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des documents
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DocumentService {
    
    private final DocumentRepository documentRepository;
    private final EnlevementRepository enlevementRepository;
    private final SocieteRepository societeRepository;
    private final StorageService storageService;
    
    /**
     * Upload un document d'enlèvement (BSDI ou PV_DESTRUCTION)
     */
    public DocumentDTO uploadDocumentEnlevement(
            Long enlevementId,
            TypeDocument typeDocument,
            MultipartFile file,
            String uploadedBy) throws Exception {
        
        log.info("Upload document {} pour enlèvement {}", typeDocument, enlevementId);
        
        // Vérifier que le type est bien BSDI ou PV
        if (!typeDocument.isDocumentEnlevement()) {
            throw new IllegalArgumentException("Ce type de document doit être rattaché à un enlèvement");
        }
        
        // Vérifier que l'enlèvement existe
        Enlevement enlevement = enlevementRepository.findById(enlevementId)
                .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé"));
        
        // Générer la clé de stockage
        String storageKey = generateStorageKey(
                enlevement.getSociete().getId(),
                enlevementId,
                typeDocument.name(),
                file.getOriginalFilename()
        );
        
        // Upload vers MinIO avec la clé générée
        storageService.putWithKey(
                storageKey,
                file.getInputStream(),
                file.getContentType()
        );
        
        // Sauvegarder en base
        Document document = Document.builder()
                .typeDocument(typeDocument)
                .enlevement(enlevement)
                .societe(enlevement.getSociete())
                .periodeMois(null)
                .fileName(file.getOriginalFilename())
                .storageKey(storageKey)
                .mimeType(file.getContentType())
                .size(file.getSize())
                .uploadedBy(uploadedBy)
                .build();
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("Document {} créé avec succès : ID {}", typeDocument, savedDocument.getId());
        return toDTO(savedDocument);
    }
    
    /**
     * Upload un document mensuel (ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE)
     */
    public DocumentDTO uploadDocumentMensuel(
            Long societeId,
            TypeDocument typeDocument,
            String periodeMois,
            MultipartFile file,
            String uploadedBy) throws Exception {
        
        log.info("Upload document mensuel {} pour société {} période {}", typeDocument, societeId, periodeMois);
        
        // Vérifier que le type est bien un document mensuel
        if (!typeDocument.isDocumentMensuel()) {
            throw new IllegalArgumentException("Ce type de document doit être mensuel");
        }
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(societeId)
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        // Générer la clé de stockage
        String storageKey = generateStorageKeyMensuel(
                societeId,
                periodeMois,
                typeDocument.name(),
                file.getOriginalFilename()
        );
        
        // Upload vers MinIO avec la clé générée
        storageService.putWithKey(
                storageKey,
                file.getInputStream(),
                file.getContentType()
        );
        
        // Sauvegarder en base
        Document document = Document.builder()
                .typeDocument(typeDocument)
                .enlevement(null)
                .societe(societe)
                .periodeMois(periodeMois)
                .fileName(file.getOriginalFilename())
                .storageKey(storageKey)
                .mimeType(file.getContentType())
                .size(file.getSize())
                .uploadedBy(uploadedBy)
                .build();
        
        Document savedDocument = documentRepository.save(document);
        
        log.info("Document mensuel {} créé avec succès : ID {}", typeDocument, savedDocument.getId());
        return toDTO(savedDocument);
    }
    
    /**
     * Récupère les documents d'un enlèvement
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsByEnlevement(Long enlevementId) {
        return documentRepository.findByEnlevementIdOrderByUploadedAtDesc(enlevementId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les documents mensuels d'une société
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsMensuelsBySociete(Long societeId) {
        return documentRepository.findDocumentsMensuelsBySociete(societeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les documents d'enlèvement d'une société (BSDI, PV)
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsEnlevementBySociete(Long societeId) {
        return documentRepository.findDocumentsEnlevementBySociete(societeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère un document par son ID
     */
    @Transactional(readOnly = true)
    public DocumentDTO getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));
        
        return toDTO(document);
    }
    
    /**
     * Supprime un document
     */
    public void deleteDocument(Long id) {
        log.info("Suppression du document ID {}", id);
        
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document non trouvé avec l'ID : " + id));
        
        // Supprimer de MinIO
        storageService.delete(document.getStorageKey());
        
        // Supprimer de la base
        documentRepository.deleteById(id);
        
        log.info("Document supprimé avec succès : ID {}", id);
    }
    
    /**
     * Vérifie qu'un enlèvement avec A_ELIMINER a bien ses documents obligatoires
     */
    @Transactional(readOnly = true)
    public boolean hasRequiredDocuments(Long enlevementId) {
        // Vérifier si l'enlèvement contient des déchets A_ELIMINER
        Enlevement enlevement = enlevementRepository.findById(enlevementId)
                .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé"));
        
        boolean hasAELiminer = enlevement.getItems().stream()
                .anyMatch(item -> item.getTypeDechet().name().equals("A_ELIMINER"));
        
        if (!hasAELiminer) {
            return true; // Pas de documents obligatoires
        }
        
        // Vérifier présence BSDI et PV
        boolean hasBsdi = documentRepository.existsBsdiForEnlevement(enlevementId);
        boolean hasPv = documentRepository.existsPvForEnlevement(enlevementId);
        
        return hasBsdi && hasPv;
    }
    
    private DocumentDTO toDTO(Document document) {
        String downloadUrl = storageService.getPresignedUrl(document.getStorageKey());
        
        return DocumentDTO.builder()
                .id(document.getId())
                .typeDocument(document.getTypeDocument().name())
                .enlevementId(document.getEnlevement() != null ? document.getEnlevement().getId() : null)
                .enlevementNumero(document.getEnlevement() != null ? document.getEnlevement().getNumeroEnlevement() : null)
                .periodeMois(document.getPeriodeMois())
                .societeId(document.getSociete().getId())
                .societeNom(document.getSociete().getRaisonSociale())
                .fileName(document.getFileName())
                .mimeType(document.getMimeType())
                .size(document.getSize())
                .uploadedAt(document.getUploadedAt())
                .uploadedBy(document.getUploadedBy())
                .downloadUrl(downloadUrl)
                .build();
    }
    
    private String generateStorageKey(Long societeId, Long enlevementId, String docType, String filename) {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String safeFilename = filename.replaceAll("[^a-zA-Z0-9.-]", "_");
        return String.format("societe/%d/enlevement/%d/%s-%s-%s", 
                societeId, enlevementId, docType.toLowerCase(), uuid, safeFilename);
    }
    
    private String generateStorageKeyMensuel(Long societeId, String periodeMois, String docType, String filename) {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String safeFilename = filename.replaceAll("[^a-zA-Z0-9.-]", "_");
        return String.format("societe/%d/mensuel/%s/%s-%s-%s", 
                societeId, periodeMois, docType.toLowerCase(), uuid, safeFilename);
    }
}

