package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
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
import java.time.LocalDate;

/**
 * Entité représentant un paiement lié à une transaction
 */
@Entity
@Table(name = "paiement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La transaction est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;
    
    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;
    
    @NotNull(message = "La date de paiement est obligatoire")
    @Column(name = "date_paiement", nullable = false)
    private LocalDate datePaiement;
    
    @NotNull(message = "Le mode de paiement est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false, length = 30)
    private ModePaiement modePaiement;
    
    @Size(max = 100, message = "La référence ne peut pas dépasser 100 caractères")
    @Column(name = "reference", length = 100)
    private String reference;
    
    @Size(max = 500, message = "Les notes ne peuvent pas dépasser 500 caractères")
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutPaiement statut = StatutPaiement.VALIDE;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    // Lien optionnel vers une échéance (pour traçabilité)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "echeance_id")
    private Echeance echeance;
    
    /**
     * Enum pour le mode de paiement
     */
    public enum ModePaiement {
        ESPECES,
        CHEQUE,
        VIREMENT,
        CARTE_BANCAIRE,
        AUTRE
    }
    
    /**
     * Enum pour le statut du paiement
     */
    public enum StatutPaiement {
        VALIDE,
        ANNULE,
        REMBOURSE
    }
}

