package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
 * Entité représentant une ligne de détail d'une vente
 */
@Entity
@Table(name = "vente_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La vente est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_id", nullable = false)
    private Vente vente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_item_id")
    private PickupItem pickupItem;
    
    @NotNull(message = "Le type de déchet est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_dechet", nullable = false, length = 20)
    private PickupItem.TypeDechet typeDechet;
    
    @Size(max = 50, message = "Le sous-type ne peut pas dépasser 50 caractères")
    @Column(name = "sous_type", length = 50)
    private String sousType;
    
    @NotNull(message = "La quantité vendue est obligatoire")
    @Positive(message = "La quantité vendue doit être positive")
    @Column(name = "quantite_vendue_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantiteVendueKg;
    
    @NotNull(message = "Le prix de vente unitaire est obligatoire")
    @DecimalMin(value = "0.01", message = "Le prix de vente doit être supérieur à 0")
    @Column(name = "prix_vente_unitaire_mad", nullable = false, precision = 10, scale = 3)
    private BigDecimal prixVenteUnitaireMad;
    
    @Column(name = "montant_vente_mad", precision = 12, scale = 2)
    private BigDecimal montantVenteMad;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @PrePersist
    @PreUpdate
    public void calculateMontant() {
        if (quantiteVendueKg != null && prixVenteUnitaireMad != null) {
            montantVenteMad = quantiteVendueKg.multiply(prixVenteUnitaireMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }
}

