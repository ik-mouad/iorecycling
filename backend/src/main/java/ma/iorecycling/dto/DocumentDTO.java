package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO pour l'entité Document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    
    private Long id;
    private String typeDocument;  // BSDI, PV_DESTRUCTION, ATTESTATION_VALORISATION, etc.
    
    // Pour documents d'enlèvement
    private Long enlevementId;
    private String enlevementNumero;
    
    // Pour documents mensuels
    private String periodeMois;  // Format YYYY-MM
    
    private Long societeId;
    private String societeNom;
    
    private String fileName;
    private String mimeType;
    private Long size;
    
    private Instant uploadedAt;
    private String uploadedBy;
    
    // URL de téléchargement (présignée)
    private String downloadUrl;
}

