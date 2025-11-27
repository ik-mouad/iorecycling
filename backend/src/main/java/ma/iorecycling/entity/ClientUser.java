package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Entité représentant un utilisateur (personne physique) rattaché à une société
 * Un utilisateur ne peut voir que les données de sa propre société
 */
@Entity
@Table(name = "client_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;
    
    @Size(max = 100, message = "Le poste occupé ne peut pas dépasser 100 caractères")
    @Column(name = "poste_occupe", length = 100)
    private String posteOccupe;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Size(max = 20)
    @Column(name = "telephone", length = 20)
    private String telephone;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @Column(name = "keycloak_user_id", length = 100)
    private String keycloakUserId;
    
    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    // Méthode utilitaire pour obtenir le nom complet
    public String getFullName() {
        return prenom + " " + nom;
    }
}

