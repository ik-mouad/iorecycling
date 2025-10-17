package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pickups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pickup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Le client est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
    
    @NotNull(message = "La date est obligatoire")
    @Column(nullable = false)
    private LocalDate date;
    
    @PositiveOrZero(message = "Le poids valorisable doit être positif ou zéro")
    @Column(name = "kg_valorisables")
    private Double kgValorisables = 0.0;
    
    @PositiveOrZero(message = "Le poids banal doit être positif ou zéro")
    @Column(name = "kg_banals")
    private Double kgBanals = 0.0;
    
    @PositiveOrZero(message = "Le poids dangereux doit être positif ou zéro")
    @Column(name = "kg_dangereux")
    private Double kgDangereux = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PickupType type = PickupType.BANAL;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    private Site site;
    
    @OneToMany(mappedBy = "pickup", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PickupItem> items = new ArrayList<>();
    
    @OneToMany(mappedBy = "pickup", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Document> documents = new ArrayList<>();
    
    // Constructeur avec paramètres pour compatibilité
    public Pickup(Client client, LocalDate date, Double kgValorisables, Double kgBanals, Double kgDangereux) {
        this.client = client;
        this.date = date;
        this.kgValorisables = kgValorisables;
        this.kgBanals = kgBanals;
        this.kgDangereux = kgDangereux;
    }
}
