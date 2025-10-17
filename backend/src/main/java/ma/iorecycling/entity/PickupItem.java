package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "pickup_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'enlèvement est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_id", nullable = false)
    private Pickup pickup;
    
    @NotBlank(message = "Le matériau est obligatoire")
    @Size(max = 40, message = "Le nom du matériau ne peut pas dépasser 40 caractères")
    @Column(nullable = false)
    private String material;
    
    @NotNull(message = "La quantité est obligatoire")
    @PositiveOrZero(message = "La quantité doit être positive ou zéro")
    @Column(name = "qty_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal qtyKg = BigDecimal.ZERO;
    
    @NotNull(message = "Le prix est obligatoire")
    @PositiveOrZero(message = "Le prix doit être positif ou zéro")
    @Column(name = "price_mad_per_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceMadPerKg = BigDecimal.ZERO;
}
