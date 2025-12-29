package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une vente de déchets à un acheteur
 */
@Entity
@Table(name = "vente")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_vente", unique = true, length = 50)
    private String numeroVente;
    
    @Column(name = "date_vente", nullable = false)
    private LocalDate dateVente;
    
    @Column(name = "acheteur_id")
    private Long acheteurId;
    
    @Size(max = 200, message = "Le nom de l'acheteur ne peut pas dépasser 200 caractères")
    @Column(name = "acheteur_nom", length = 200)
    private String acheteurNom;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutVente statut = StatutVente.BROUILLON;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    // Relations
    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VenteItem> items = new ArrayList<>();
    
    // Méthodes utilitaires
    public void addItem(VenteItem item) {
        items.add(item);
        item.setVente(this);
    }
    
    public void removeItem(VenteItem item) {
        items.remove(item);
        item.setVente(null);
    }
    
    /**
     * Enum pour le statut de la vente
     */
    public enum StatutVente {
        BROUILLON,      // En cours de saisie
        VALIDEE,       // Validée (génère transactions)
        ANNULEE        // Annulée
    }
}

