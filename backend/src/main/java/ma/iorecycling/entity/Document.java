package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Entité représentant un document (PDF, image, etc.)
 * Un document peut être :
 * - Lié à un enlèvement spécifique (BSDI, PV_DESTRUCTION)
 * - Mensuel, non lié à un enlèvement (ATTESTATION_VALORISATION, ATTESTATION_ELIMINATION, FACTURE)
 */
@Entity
@Table(name = "document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Le type de document est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_document", nullable = false, length = 50)
    private TypeDocument typeDocument;
    
    // Nullable : uniquement pour BSDI et PV_DESTRUCTION
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enlevement_id")
    private Enlevement enlevement;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    // Nullable : uniquement pour les documents mensuels (format YYYY-MM)
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Le format de la période doit être YYYY-MM")
    @Size(max = 7)
    @Column(name = "periode_mois", length = 7)
    private String periodeMois;
    
    @NotBlank(message = "Le nom du fichier est obligatoire")
    @Size(max = 255)
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @NotBlank(message = "La clé de stockage est obligatoire")
    @Column(name = "storage_key", nullable = false, columnDefinition = "TEXT")
    private String storageKey;
    
    @Size(max = 100)
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @Column(name = "size")
    private Long size;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;
    
    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;
    
    /**
     * Enum pour les types de documents
     */
    public enum TypeDocument {
        // Documents d'enlèvement (enlevementId NOT NULL, periodeMois NULL)
        BSDI("Bordereau de Suivi des Déchets Industriels"),
        PV_DESTRUCTION("Procès-verbal de destruction"),
        AUTRE("Autre"),
        
        // Documents mensuels (enlevementId NULL, periodeMois NOT NULL)
        ATTESTATION_VALORISATION("Attestation mensuelle de valorisation"),
        ATTESTATION_ELIMINATION("Attestation mensuelle d'élimination"),
        FACTURE("Facture mensuelle");
        
        private final String description;
        
        TypeDocument(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
        
        public boolean isDocumentEnlevement() {
            return this == BSDI || this == PV_DESTRUCTION || this == AUTRE;
        }
        
        public boolean isDocumentMensuel() {
            return this == ATTESTATION_VALORISATION || 
                   this == ATTESTATION_ELIMINATION || 
                   this == FACTURE;
        }
    }
    
    /**
     * Validation : un document doit être soit lié à un enlèvement, soit mensuel (XOR)
     */
    @PrePersist
    @PreUpdate
    public void validateDocumentType() {
        if (typeDocument.isDocumentEnlevement()) {
            if (enlevement == null) {
                throw new IllegalStateException(
                    "Un document de type " + typeDocument + " doit être rattaché à un enlèvement");
            }
            if (periodeMois != null) {
                throw new IllegalStateException(
                    "Un document de type " + typeDocument + " ne peut pas avoir de période mensuelle");
            }
        }
        
        if (typeDocument.isDocumentMensuel()) {
            if (enlevement != null) {
                throw new IllegalStateException(
                    "Un document de type " + typeDocument + " ne peut pas être rattaché à un enlèvement");
            }
            if (periodeMois == null || periodeMois.trim().isEmpty()) {
                throw new IllegalStateException(
                    "Un document de type " + typeDocument + " doit avoir une période mensuelle");
            }
        }
    }
}