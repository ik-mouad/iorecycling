package ma.iorecycling.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

@Entity
@Table(name = "pickups")
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
    
    // Constructeurs
    public Pickup() {}
    
    public Pickup(Client client, LocalDate date, Double kgValorisables, Double kgBanals, Double kgDangereux) {
        this.client = client;
        this.date = date;
        this.kgValorisables = kgValorisables;
        this.kgBanals = kgBanals;
        this.kgDangereux = kgDangereux;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Client getClient() {
        return client;
    }
    
    public void setClient(Client client) {
        this.client = client;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Double getKgValorisables() {
        return kgValorisables;
    }
    
    public void setKgValorisables(Double kgValorisables) {
        this.kgValorisables = kgValorisables;
    }
    
    public Double getKgBanals() {
        return kgBanals;
    }
    
    public void setKgBanals(Double kgBanals) {
        this.kgBanals = kgBanals;
    }
    
    public Double getKgDangereux() {
        return kgDangereux;
    }
    
    public void setKgDangereux(Double kgDangereux) {
        this.kgDangereux = kgDangereux;
    }
    
    @Override
    public String toString() {
        return "Pickup{" +
                "id=" + id +
                ", client=" + (client != null ? client.getCode() : null) +
                ", date=" + date +
                ", kgValorisables=" + kgValorisables +
                ", kgBanals=" + kgBanals +
                ", kgDangereux=" + kgDangereux +
                '}';
    }
}
