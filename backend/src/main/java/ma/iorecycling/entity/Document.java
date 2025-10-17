package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'enlèvement est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id", nullable = false)
    private Pickup pickup;
    
    @NotBlank(message = "Le type de document est obligatoire")
    @Size(max = 30, message = "Le type de document ne peut pas dépasser 30 caractères")
    @Column(name = "doc_type", nullable = false)
    private String docType;
    
    @NotBlank(message = "Le nom du fichier est obligatoire")
    @Column(nullable = false)
    private String filename;
    
    @NotBlank(message = "L'URL est obligatoire")
    @Column(nullable = false)
    private String url;
}
