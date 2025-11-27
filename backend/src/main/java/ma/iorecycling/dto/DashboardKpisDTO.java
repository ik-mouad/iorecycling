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
    
    // KPI 4 : Budget valorisation
    private BigDecimal budgetValorisation;
    private Double evolutionValorisationPct;
    
    // KPI 5 : Budget traitement (A ELIMINER)
    private BigDecimal budgetTraitement;
    private Double evolutionTraitementPct;
    
    // Bilan global
    private BigDecimal bilanNet;
    private Double tauxValorisation;
    
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
        private BigDecimal valorisable;
        private BigDecimal banal;
        private BigDecimal aEliminer;
        private BigDecimal total;
        
        private Double pourcentageValorisable;
        private Double pourcentageBanal;
        private Double pourcentageAEliminer;
        
        // Détail par sous-type pour VALORISABLE
        private Map<String, BigDecimal> detailValorisable;
    }
}

