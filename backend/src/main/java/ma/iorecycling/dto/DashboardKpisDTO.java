package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * DTO pour les 5 KPIs du portail client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpisDTO {
    
    // KPI 1 : Date du prochain enlèvement
    private ProchainEnlevementDTO prochainEnlevement;
    
    // KPI 2 : Quantités par type de déchet
    private QuantitesParTypeDTO quantites;
    
    // KPI 3 : Nombre total d'enlèvements
    private Long nombreEnlevements;
    private Double moyenneParSemaine;
    
    // KPI 4 : Budget recyclage
    private BigDecimal budgetRecyclage;
    private Double evolutionRecyclagePct;
    
    // KPI 5 : Budget traitement (A DETRUIRE)
    private BigDecimal budgetTraitement;
    private Double evolutionTraitementPct;
    
    // Bilan global
    private BigDecimal bilanNet;
    private Double tauxRecyclage;
    
    // Période analysée
    private LocalDate dateDebut;
    private LocalDate dateFin;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProchainEnlevementDTO {
        private LocalDate datePrevue;
        private String heurePrevue;
        private Long siteId;
        private String siteNom;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuantitesParTypeDTO {
        private BigDecimal recyclable;
        private BigDecimal banal;
        private BigDecimal aDetruire;
        private BigDecimal total;
        
        private Double pourcentageRecyclable;
        private Double pourcentageBanal;
        private Double pourcentageADetruire;
        
        // Détail par sous-type pour RECYCLABLE
        private Map<String, BigDecimal> detailRecyclable;
    }
}

