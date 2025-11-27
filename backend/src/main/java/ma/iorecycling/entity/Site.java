package ma.iorecycling.entity;

import jakarta.persistence.*;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un site de collecte d'une société
 * Un site appartient à une seule société
 */
@Entity
@Table(name = "site")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Site {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @NotBlank(message = "Le nom du site est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    // Relations
    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Enlevement> enlevements = new ArrayList<>();
}