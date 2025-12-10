package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
 * Entité représentant une société cliente
 * Une société possède un ICE unique, des sites, des utilisateurs et des enlèvements
 */
@Entity
@Table(name = "societe")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Societe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    @Column(name = "raison_sociale", nullable = false)
    private String raisonSociale;
    
    @NotBlank(message = "L'ICE est obligatoire")
    @Pattern(regexp = "\\d{15}", message = "L'ICE doit contenir exactement 15 chiffres")
    @Column(name = "ice", unique = true, nullable = false, length = 15)
    private String ice;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    @Column(name = "email", nullable = false)
    private String email;
    
    @Size(max = 20)
    @Column(name = "telephone", length = 20)
    private String telephone;
    
    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    // Relations
    @OneToMany(mappedBy = "societe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Site> sites = new ArrayList<>();
    
    @OneToMany(mappedBy = "societe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClientUser> users = new ArrayList<>();
    
    @OneToMany(mappedBy = "societe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Enlevement> enlevements = new ArrayList<>();
    
    @OneToMany(mappedBy = "societe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
    
    // Méthodes utilitaires
    public void addSite(Site site) {
        sites.add(site);
        site.setSociete(this);
    }
    
    public void removeSite(Site site) {
        sites.remove(site);
        site.setSociete(null);
    }
    
    public void addUser(ClientUser user) {
        users.add(user);
        user.setSociete(this);
    }
    
    public void removeUser(ClientUser user) {
        users.remove(user);
        user.setSociete(null);
    }
}

