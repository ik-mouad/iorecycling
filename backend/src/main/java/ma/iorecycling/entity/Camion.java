package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entité représentant un camion de la flotte
 * Un camion appartient à une société (IORecycling ou partenaire)
 */
@Entity
@Table(name = "camion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Camion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le matricule est obligatoire")
    @Size(max = 50, message = "Le matricule ne peut pas dépasser 50 caractères")
    @Column(name = "matricule", unique = true, nullable = false, length = 50)
    private String matricule;
    
    @NotNull(message = "Le tonnage maximum est obligatoire")
    @DecimalMin(value = "0.01", message = "Le tonnage maximum doit être supérieur à 0")
    @Column(name = "tonnage_max_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal tonnageMaxKg;
    
    @NotNull(message = "Le type de camion est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_camion", nullable = false, length = 20)
    private TypeCamion typeCamion;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @NotNull(message = "La société propriétaire est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_proprietaire_id", nullable = false)
    private SocieteProprietaire societeProprietaire;
    
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

