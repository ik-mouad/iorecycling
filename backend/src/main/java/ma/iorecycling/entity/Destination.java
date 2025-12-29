package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une destination (centre de tri/traitement)
 * Une destination peut traiter plusieurs types de déchets
 */
@Entity
@Table(name = "destination")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    @Column(name = "raison_sociale", nullable = false)
    private String raisonSociale;
    
    @NotBlank(message = "Le site est obligatoire")
    @Size(max = 255, message = "Le site ne peut pas dépasser 255 caractères")
    @Column(name = "site", nullable = false)
    private String site;
    
    @NotEmpty(message = "Au moins un type de traitement est obligatoire")
    @ElementCollection(targetClass = TypeTraitement.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "destination_types_traitement", joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "type_traitement", nullable = false)
    @Builder.Default
    private List<TypeTraitement> typesTraitement = new ArrayList<>();
    
    @Size(max = 100, message = "Le nom de l'interlocuteur ne peut pas dépasser 100 caractères")
    @Column(name = "nom_interlocuteur", length = 100)
    private String nomInterlocuteur;
    
    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    @Column(name = "tel_interlocuteur", length = 20)
    private String telInterlocuteur;
    
    @Size(max = 100, message = "Le poste ne peut pas dépasser 100 caractères")
    @Column(name = "poste_interlocuteur", length = 100)
    private String posteInterlocuteur;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    @Column(name = "email_interlocuteur", length = 255)
    private String emailInterlocuteur;
    
    @Size(max = 500, message = "L'adresse ne peut pas dépasser 500 caractères")
    @Column(name = "adresse", length = 500)
    private String adresse;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    /**
     * Vérifie si la destination peut traiter des déchets dangereux (A_DETRUIRE)
     */
    public boolean peutTraiterDechetsDangereux() {
        return typesTraitement.contains(TypeTraitement.INCINERATION) ||
               typesTraitement.contains(TypeTraitement.ENFOUISSEMENT) ||
               typesTraitement.contains(TypeTraitement.DENATURATION_DESTRUCTION) ||
               typesTraitement.contains(TypeTraitement.TRAITEMENT);
    }
}

