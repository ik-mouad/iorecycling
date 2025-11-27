package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité représentant un enlèvement (collecte) de déchets
 * Un enlèvement appartient à une société et à un site
 * Il contient plusieurs items (lignes de détail) et peut avoir des documents attachés
 */
@Entity
@Table(name = "enlevement")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enlevement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_enlevement", unique = true, length = 50)
    private String numeroEnlevement;
    
    @NotNull(message = "La date de l'enlèvement est obligatoire")
    @Column(name = "date_enlevement", nullable = false)
    private LocalDate dateEnlevement;
    
    @NotNull(message = "Le site est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
    
    @NotNull(message = "La société est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "societe_id", nullable = false)
    private Societe societe;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    // Relations
    @OneToMany(mappedBy = "enlevement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PickupItem> items = new ArrayList<>();
    
    @OneToMany(mappedBy = "enlevement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
    
    // Méthodes utilitaires
    public void addItem(PickupItem item) {
        items.add(item);
        item.setEnlevement(this);
    }
    
    public void removeItem(PickupItem item) {
        items.remove(item);
        item.setEnlevement(null);
    }
    
    public void addDocument(Document document) {
        documents.add(document);
        document.setEnlevement(this);
    }
    
    public void removeDocument(Document document) {
        documents.remove(document);
        document.setEnlevement(null);
    }
}

