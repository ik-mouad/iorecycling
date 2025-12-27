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
import java.util.ArrayList;
import java.util.List;

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
    
    @Size(max = 20, message = "L'unité de mesure ne peut pas dépasser 20 caractères")
    @Column(name = "unite_mesure", length = 20)
    private String uniteMesure;  // kg, L, m³, unité, etc.
    
    @Size(max = 20, message = "L'état ne peut pas dépasser 20 caractères")
    @Column(name = "etat", length = 20)
    private String etat;  // vrac, compacté, broyé, Palettisé, autre
    
    @NotNull(message = "Le prix unitaire est obligatoire")
    @PositiveOrZero(message = "Le prix unitaire doit être positif ou zéro")
    @Column(name = "prix_unitaire_mad", nullable = false, precision = 10, scale = 3)
    private BigDecimal prixUnitaireMad;
    
    @Column(name = "montant_mad", precision = 12, scale = 2)
    private BigDecimal montantMad;
    
    // NOUVEAUX CHAMPS - Prestation (tous types)
    @Column(name = "prix_prestation_mad", precision = 10, scale = 3)
    private BigDecimal prixPrestationMad;
    
    @Column(name = "montant_prestation_mad", precision = 12, scale = 2)
    private BigDecimal montantPrestationMad;
    
    // NOUVEAUX CHAMPS - Achat (valorisable)
    @Column(name = "prix_achat_mad", precision = 10, scale = 3)
    private BigDecimal prixAchatMad;
    
    @Column(name = "montant_achat_mad", precision = 12, scale = 2)
    private BigDecimal montantAchatMad;
    
    // NOUVEAUX CHAMPS - Traitement (banal)
    @Column(name = "prix_traitement_mad", precision = 10, scale = 3)
    private BigDecimal prixTraitementMad;
    
    @Column(name = "montant_traitement_mad", precision = 12, scale = 2)
    private BigDecimal montantTraitementMad;
    
    // NOUVEAUX CHAMPS - Suivi vente
    @Column(name = "quantite_vendue_kg", precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal quantiteVendueKg = BigDecimal.ZERO;
    
    @Column(name = "reste_a_vendre_kg", precision = 10, scale = 3)
    private BigDecimal resteAVendreKg;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    // Relation vers vente_item
    @OneToMany(mappedBy = "pickupItem", fetch = FetchType.LAZY)
    @Builder.Default
    private List<VenteItem> venteItems = new ArrayList<>();
    
    /**
     * Enum pour les types de déchets
     */
    public enum TypeDechet {
        RECYCLABLE,   // Déchets recyclables (génère un revenu)
        BANAL,        // Déchets ordinaires (génère un coût)
        A_DETRUIRE    // Déchets dangereux (génère un coût élevé + documents obligatoires)
    }
    
    /**
     * Hook JPA unique pour effectuer les validations et calculs avant insert/update
     */
    @PrePersist
    @PreUpdate
    public void validateAndCalculate() {
        if (TypeDechet.RECYCLABLE.equals(typeDechet) && (sousType == null || sousType.trim().isEmpty())) {
            throw new IllegalStateException("Le sous-type est obligatoire pour les déchets RECYCLABLE");
        }
        
        if (TypeDechet.A_DETRUIRE.equals(typeDechet) && (sousType == null || sousType.trim().isEmpty())) {
            throw new IllegalStateException("Le sous-type est obligatoire pour les déchets A_DETRUIRE (dangereux ou non dangereux)");
        }
        
        if (quantiteKg != null && prixUnitaireMad != null) {
            montantMad = quantiteKg.multiply(prixUnitaireMad)
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            montantMad = BigDecimal.ZERO;
        }
        
        // Calcul montant prestation
        if (prixPrestationMad != null && quantiteKg != null) {
            montantPrestationMad = quantiteKg.multiply(prixPrestationMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul montant achat (si valorisable)
        if (TypeDechet.RECYCLABLE.equals(typeDechet) && prixAchatMad != null && quantiteKg != null) {
            montantAchatMad = quantiteKg.multiply(prixAchatMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul montant traitement (si banal)
        if ((TypeDechet.BANAL.equals(typeDechet) || TypeDechet.A_DETRUIRE.equals(typeDechet)) 
                && prixTraitementMad != null && quantiteKg != null) {
            montantTraitementMad = quantiteKg.multiply(prixTraitementMad)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        
        // Calcul reste à vendre
        if (quantiteKg != null) {
            resteAVendreKg = quantiteKg.subtract(quantiteVendueKg != null ? quantiteVendueKg : BigDecimal.ZERO)
                    .setScale(3, RoundingMode.HALF_UP);
        }
    }
    
    /**
     * Calcule le statut du stock
     */
    public StatutStock getStatutStock() {
        if (resteAVendreKg == null || resteAVendreKg.compareTo(BigDecimal.ZERO) == 0) {
            return StatutStock.VENDU;
        }
        if (quantiteVendueKg == null || quantiteVendueKg.compareTo(BigDecimal.ZERO) == 0) {
            return StatutStock.NON_VENDU;
        }
        return StatutStock.PARTIELLEMENT_VENDU;
    }
    
    /**
     * Enum pour le statut du stock
     */
    public enum StatutStock {
        NON_VENDU,
        PARTIELLEMENT_VENDU,
        VENDU
    }
}