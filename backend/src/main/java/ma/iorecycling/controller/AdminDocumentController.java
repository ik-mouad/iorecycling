package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DocumentDTO;
import ma.iorecycling.entity.Document.TypeDocument;
import ma.iorecycling.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller REST pour la gestion des documents (Admin)
 */
@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Documents", description = "API pour la gestion des documents")
@PreAuthorize("hasRole('ADMIN') or hasRole('BACKOFFICE')")
public class AdminDocumentController {
    
    private final DocumentService documentService;
    
    /**
     * Upload un document pour un enlèvement (BSDI ou PV_DESTRUCTION)
     */
    @PostMapping(value = "/enlevement/{enlevementId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document d'enlèvement", description = "Upload un BSDI ou PV pour un enlèvement")
    public ResponseEntity<DocumentDTO> uploadDocumentEnlevement(
            @PathVariable Long enlevementId,
            @RequestParam("typeDocument") String typeDocumentStr,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/documents/enlevement/{} - type {}", enlevementId, typeDocumentStr);
        
        try {
            TypeDocument typeDocument = TypeDocument.valueOf(typeDocumentStr.toUpperCase());
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "admin";
            
            DocumentDTO document = documentService.uploadDocumentEnlevement(
                    enlevementId, typeDocument, file, username);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
            
        } catch (IllegalArgumentException e) {
            log.error("Type de document invalide : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erreur upload document : {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Upload un document mensuel (ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE)
     */
    @PostMapping(value = "/mensuel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document mensuel", description = "Upload une attestation ou facture mensuelle")
    public ResponseEntity<DocumentDTO> uploadDocumentMensuel(
            @RequestParam("societeId") Long societeId,
            @RequestParam("typeDocument") String typeDocumentStr,
            @RequestParam("periodeMois") String periodeMois,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("POST /api/admin/documents/mensuel - société {} type {} période {}", 
                societeId, typeDocumentStr, periodeMois);
        
        try {
            TypeDocument typeDocument = TypeDocument.valueOf(typeDocumentStr.toUpperCase());
            String username = jwt != null ? jwt.getClaimAsString("preferred_username") : "admin";
            
            DocumentDTO document = documentService.uploadDocumentMensuel(
                    societeId, typeDocument, periodeMois, file, username);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
            
        } catch (IllegalArgumentException e) {
            log.error("Type de document invalide : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erreur upload document mensuel : {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère les documents d'un enlèvement
     */
    @GetMapping("/enlevement/{enlevementId}")
    @Operation(summary = "Documents d'un enlèvement", description = "Récupère tous les documents d'un enlèvement")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByEnlevement(@PathVariable Long enlevementId) {
        log.info("GET /api/admin/documents/enlevement/{}", enlevementId);
        
        List<DocumentDTO> documents = documentService.getDocumentsByEnlevement(enlevementId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Supprime un document
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un document", description = "Supprime un document (fichier MinIO + base de données)")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        log.info("DELETE /api/admin/documents/{}", id);
        
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Document non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

/**
 * Controller REST pour la consultation des documents (Client)
 */
@RestController
@RequestMapping("/api/client/documents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Client Documents", description = "API pour consulter et télécharger les documents")
@PreAuthorize("hasRole('CLIENT')")
class ClientDocumentController {
    
    private final DocumentService documentService;
    private final ma.iorecycling.service.ClientContextService clientContextService;
    
    /**
     * Récupère les documents d'enlèvement (BSDI, PV) de la société
     */
    @GetMapping("/enlevement")
    @Operation(summary = "Documents d'enlèvement", description = "Récupère les BSDI et PV de la société")
    public ResponseEntity<List<DocumentDTO>> getDocumentsEnlevement(
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/documents/enlevement - société {}", societeId);
        
        List<DocumentDTO> documents = documentService.getDocumentsEnlevementBySociete(societeId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Récupère les documents mensuels de la société
     */
    @GetMapping("/mensuels")
    @Operation(summary = "Documents mensuels", description = "Récupère les attestations et factures mensuelles")
    public ResponseEntity<List<DocumentDTO>> getDocumentsMensuels(
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/documents/mensuels - société {}", societeId);
        
        List<DocumentDTO> documents = documentService.getDocumentsMensuelsBySociete(societeId);
        return ResponseEntity.ok(documents);
    }
    
    /**
     * Récupère un document par son ID (avec URL de téléchargement)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail document", description = "Récupère les détails d'un document avec URL de téléchargement")
    public ResponseEntity<DocumentDTO> getDocumentById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        
        Long societeId = clientContextService.getClientId(jwt);
        if (societeId == null) {
            log.error("Impossible d'extraire la société depuis le JWT");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        log.info("GET /api/client/documents/{} - société {}", id, societeId);
        
        try {
            DocumentDTO document = documentService.getDocumentById(id);
            
            // Vérifier que le document appartient bien à la société de l'utilisateur
            if (document.getSocieteId() == null || !document.getSocieteId().equals(societeId)) {
                log.warn("Tentative d'accès à un document d'une autre société: document.societeId={}, user.societeId={}", 
                        document.getSocieteId(), societeId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(document);
        } catch (IllegalArgumentException e) {
            log.error("Document non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

