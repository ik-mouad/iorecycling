package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entité représentant une société propriétaire de camions
 * Sépare des sociétés clientes - peut être un partenaire, sous-traitant, etc.
 */
@Entity
@Table(name = "societe_proprietaire")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocieteProprietaire {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    @Column(name = "raison_sociale", nullable = false)
    private String raisonSociale;
    
    @Size(max = 100, message = "Le contact ne peut pas dépasser 100 caractères")
    @Column(name = "contact", length = 100)
    private String contact;
    
    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    @Column(name = "telephone", length = 20)
    private String telephone;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    @Column(name = "email", length = 255)
    private String email;
    
    @Size(max = 500, message = "L'adresse ne peut pas dépasser 500 caractères")
    @Column(name = "adresse", length = 500)
    private String adresse;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

