package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

/**
 * Entité représentant une ligne de détail d'un enlèvement
 * Chaque item représente un type de déchet spécifique avec sa quantité et son prix
 */
@Entity
@Table(name = "pickup_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'enlèvement est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enlevement_id", nullable = false)
    private Enlevement enlevement;
    
    @NotNull(message = "Le type de déchet est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_dechet", nullable = false, length = 20)
    private TypeDechet typeDechet;
    
    @Size(max = 50, message = "Le sous-type ne peut pas dépasser 50 caractères")
    @Column(name = "sous_type", length = 50)
    private String sousType;
    
    @NotNull(message = "La quantité est obligatoire")
    @PositiveOrZero(message = "La quantité doit être positive ou zéro")
    @Column(name = "quantite_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantiteKg;
    
    @NotNull(message = "Le prix unitaire est obligatoire")
    @PositiveOrZero(message = "Le prix unitaire doit être positif ou zéro")
    @Column(name = "prix_unitaire_mad", nullable = false, precision = 10, scale = 3)
    private BigDecimal prixUnitaireMad;
    
    @Column(name = "montant_mad", precision = 12, scale = 2)
    private BigDecimal montantMad;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    /**
     * Enum pour les types de déchets
     */
    public enum TypeDechet {
        VALORISABLE,  // Déchets recyclables (génère un revenu)
        BANAL,        // Déchets ordinaires (génère un coût)
        A_ELIMINER    // Déchets dangereux (génère un coût élevé + documents obligatoires)
    }
    
    /**
     * Hook JPA unique pour effectuer les validations et calculs avant insert/update
     */
    @PrePersist
    @PreUpdate
    public void validateAndCalculate() {
        if (TypeDechet.VALORISABLE.equals(typeDechet) && (sousType == null || sousType.trim().isEmpty())) {
            throw new IllegalStateException("Le sous-type est obligatoire pour les déchets VALORISABLE");
        }
        
        if (quantiteKg != null && prixUnitaireMad != null) {
            montantMad = quantiteKg.multiply(prixUnitaireMad)
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            montantMad = BigDecimal.ZERO;
        }
    }
}