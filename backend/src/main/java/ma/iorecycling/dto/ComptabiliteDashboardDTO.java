package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO pour le dashboard de comptabilité
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComptabiliteDashboardDTO {
    
    // KPIs principaux
    private BigDecimal totalRecettes;
    private BigDecimal totalDepenses;
    private BigDecimal resultatNet; // Recettes - Dépenses
    private BigDecimal tresorerie; // Solde actuel
    
    // Évolutions
    private Double evolutionRecettesPct;
    private Double evolutionDepensesPct;
    private Double evolutionResultatPct;
    
    // Paiements et impayés
    private BigDecimal totalPaiementsRecus;
    private BigDecimal totalImpayes;
    private Long nombreTransactionsImpayees;
    
    // Échéances
    private Long nombreEcheancesEnRetard;
    private BigDecimal montantEcheancesEnRetard;
    private Long nombreEcheancesAVenir;
    private BigDecimal montantEcheancesAVenir;
    
    // Répartition par catégorie (dépenses)
    private Map<String, BigDecimal> depensesParCategorie;
    
    // Évolution mensuelle (12 derniers mois)
    private List<EvolutionMensuelleDTO> evolutionMensuelle;
    
    // Période analysée
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String periode; // "mensuel", "trimestriel", "annuel"
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvolutionMensuelleDTO {
        private String mois; // Format "YYYY-MM"
        private String moisLibelle; // Format "Janvier 2024"
        private BigDecimal recettes;
        private BigDecimal depenses;
        private BigDecimal resultat;
    }
}

