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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant une transaction comptable (recette ou dépense)
 * Une transaction peut avoir plusieurs paiements et échéances
 */
@Entity
@Table(name = "transaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Le type de transaction est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TypeTransaction type;
    
    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    @Column(name = "montant", nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;
    
    @NotNull(message = "La date est obligatoire")
    @Column(name = "date_transaction", nullable = false)
    private LocalDate dateTransaction;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    @Column(name = "description", nullable = false, length = 500)
    private String description;
    
    @Size(max = 100, message = "La catégorie ne peut pas dépasser 100 caractères")
    @Column(name = "categorie", length = 100)
    private String categorie;
    
    @Size(max = 50, message = "Le numéro de référence ne peut pas dépasser 50 caractères")
    @Column(name = "numero_reference", length = 50)
    private String numeroReference;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enlevement_id")
    private Enlevement enlevement;
    
    // NOUVEAU CHAMP - Type de recette (PRESTATION ou VENTE_MATIERE)
    @Enumerated(EnumType.STRING)
    @Column(name = "type_recette", length = 20)
    private TypeRecette typeRecette;
    
    // NOUVEAU CHAMP - Lien vers vente_item pour recettes vente matière
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vente_item_id")
    private VenteItem venteItem;
    
    @Size(max = 1000, message = "Les notes ne peuvent pas dépasser 1000 caractères")
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutTransaction statut = StatutTransaction.EN_ATTENTE;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    // Relations
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Paiement> paiements = new ArrayList<>();
    
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Echeance> echeances = new ArrayList<>();
    
    // Méthodes utilitaires
    public void addPaiement(Paiement paiement) {
        paiements.add(paiement);
        paiement.setTransaction(this);
    }
    
    public void removePaiement(Paiement paiement) {
        paiements.remove(paiement);
        paiement.setTransaction(null);
    }
    
    public void addEcheance(Echeance echeance) {
        echeances.add(echeance);
        echeance.setTransaction(this);
    }
    
    public void removeEcheance(Echeance echeance) {
        echeances.remove(echeance);
        echeance.setTransaction(null);
    }
    
    /**
     * Calcule le montant total payé
     */
    public BigDecimal getMontantPaye() {
        return paiements.stream()
                .map(Paiement::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Calcule le montant restant à payer
     */
    public BigDecimal getMontantRestant() {
        return montant.subtract(getMontantPaye());
    }
    
    /**
     * Vérifie si la transaction est complètement payée
     */
    public boolean isCompletementPayee() {
        return getMontantRestant().compareTo(BigDecimal.ZERO) <= 0;
    }
    
    /**
     * Enum pour le type de transaction
     */
    public enum TypeTransaction {
        RECETTE,    // Recette (facturation client)
        DEPENSE     // Dépense (charges, fournisseurs, etc.)
    }
    
    /**
     * Enum pour le statut de la transaction
     */
    public enum StatutTransaction {
        EN_ATTENTE,     // En attente de paiement
        PARTIELLEMENT_PAYEE,  // Partiellement payée
        PAYEE,          // Complètement payée
        ANNULEE        // Annulée
    }
    
    /**
     * Enum pour le type de recette
     */
    public enum TypeRecette {
        PRESTATION,      // Recette prestation d'enlèvement
        VENTE_MATIERE    // Recette vente de matière
    }
}

