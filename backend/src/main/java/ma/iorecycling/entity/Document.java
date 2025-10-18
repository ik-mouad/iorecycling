package ma.iorecycling.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Document associé à un enlèvement
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
    
    @Column(name = "pickup_id", nullable = false)
    private Long pickupId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 30)
    private DocumentType docType;
    
    @Column(name = "filename", nullable = false, columnDefinition = "TEXT")
    private String filename;
    
    @Column(name = "object_key", nullable = false, columnDefinition = "TEXT")
    private String objectKey;
    
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
    
    @Column(name = "created_by", length = 50)
    private String createdBy;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id", insertable = false, updatable = false)
    private Pickup pickup;
    
    /**
     * Types de documents supportés
     */
    public enum DocumentType {
        BORDEREAU("Bordereau de collecte"),
        CERTIFICAT("Certificat de traitement"),
        FACTURE("Facture"),
        PHOTO("Photo de preuve");
        
        private final String description;
        
        DocumentType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}