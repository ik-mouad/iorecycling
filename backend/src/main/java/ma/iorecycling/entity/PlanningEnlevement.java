package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Entité représentant un enlèvement planifié (pas encore réalisé)
 * Utilisé pour afficher le "prochain enlèvement" dans le dashboard client
 */
@Entity
@Table(name = "planning_enlevement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningEnlevement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La date prévue est obligatoire")
    @Column(name = "date_prevue", nullable = false)
    private LocalDate datePrevue;
    
    @Size(max = 50)
    @Column(name = "heure_prevue", length = 50)
    private String heurePrevue;
    
    @NotNull(message = "Le site est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    @Builder.Default
    private StatutPlanning statut = StatutPlanning.PLANIFIE;
    
    @Size(max = 500)
    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurrence_id")
    private Recurrence recurrence;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enlevement_id")
    private Enlevement enlevement;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    /**
     * Enum pour les statuts de planning
     */
    public enum StatutPlanning {
        PLANIFIE("Planifié"),
        CONFIRME("Confirmé"),
        REALISE("Réalisé"),
        ANNULE("Annulé");
        
        private final String description;
        
        StatutPlanning(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}

