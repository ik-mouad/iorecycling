package ma.iorecycling.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Item détaillé d'un enlèvement recyclable
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
    
    @Column(name = "pickup_id", nullable = false)
    private Long pickupId;
    
    @Column(name = "material", nullable = false, length = 40)
    private String material;
    
    @Column(name = "qty_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal qtyKg;
    
    @Column(name = "price_mad_per_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal priceMadPerKg;
    
    @Column(name = "total_mad", precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalMad; // Calculé automatiquement par la DB
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id", insertable = false, updatable = false)
    private Pickup pickup;
    
    /**
     * Calcule le total en MAD
     */
    public BigDecimal calculateTotal() {
        if (qtyKg != null && priceMadPerKg != null) {
            return qtyKg.multiply(priceMadPerKg);
        }
        return BigDecimal.ZERO;
    }
}