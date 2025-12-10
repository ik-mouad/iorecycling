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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entité représentant une demande d'enlèvement ponctuel
 * Permet aux clients de demander des collectes en ligne
 */
@Entity
@Table(name = "demande_enlevement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeEnlevement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_demande", unique = true, length = 50)
    private String numeroDemande;
    
    @NotNull(message = "La date souhaitée est obligatoire")
    @Column(name = "date_souhaitee", nullable = false)
    private LocalDate dateSouhaitee;
    
    @Size(max = 50)
    @Column(name = "heure_souhaitee", length = 50)
    private String heureSouhaitee;
    
    @NotNull(message = "Le site est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @Size(max = 100)
    @Column(name = "type_dechet_estime", length = 100)
    private String typeDechetEstime;
    
    @PositiveOrZero(message = "La quantité estimée doit être positive")
    @Column(name = "quantite_estimee")
    private Double quantiteEstimee;
    
    @Size(max = 1000)
    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutDemande statut = StatutDemande.EN_ATTENTE;
    
    @Size(max = 500)
    @Column(name = "motif_refus", columnDefinition = "TEXT")
    private String motifRefus;
    
    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
    
    @UpdateTimestamp
    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "treated_by", length = 100)
    private String treatedBy;
    
    /**
     * Enum pour les statuts de demande
     */
    public enum StatutDemande {
        EN_ATTENTE("En attente de traitement"),
        VALIDEE("Demande validée"),
        PLANIFIEE("Enlèvement planifié"),
        REALISEE("Enlèvement réalisé"),
        REFUSEE("Demande refusée"),
        ANNULEE("Demande annulée");
        
        private final String description;
        
        StatutDemande(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // Le numéro sera généré dans le service après l'insertion
}

