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
 * Entité représentant une récurrence d'enlèvement
 * Génère automatiquement des PlanningEnlevement selon la fréquence définie
 */
@Entity
@Table(name = "recurrence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recurrence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @NotNull(message = "Le site est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
    
    @NotNull(message = "Le type de récurrence est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_recurrence", nullable = false, length = 20)
    private TypeRecurrence typeRecurrence;
    
    @Size(max = 20)
    @Column(name = "jour_semaine", length = 20)
    private String jourSemaine;
    
    @Size(max = 50)
    @Column(name = "jours_semaine_bimensuel", length = 50)
    private String joursSemaneBimensuel;
    
    @Column(name = "jour_mois")
    private Integer jourMois;
    
    @Size(max = 50)
    @Column(name = "heure_prevue", length = 50)
    private String heurePrevue;
    
    @NotNull(message = "La date de début est obligatoire")
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;
    
    @Column(name = "date_fin")
    private LocalDate dateFin;
    
    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    /**
     * Enum pour les types de récurrence
     */
    public enum TypeRecurrence {
        HEBDOMADAIRE("Hebdomadaire"),
        BIMENSUELLE("Bimensuelle (2x/semaine)"),
        MENSUELLE("Mensuelle"),
        PERSONNALISEE("Personnalisée");
        
        private final String description;
        
        TypeRecurrence(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}

