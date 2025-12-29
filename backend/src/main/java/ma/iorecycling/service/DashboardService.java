package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.DashboardKpisDTO;
import ma.iorecycling.dto.DashboardKpisDTO.ProchainEnlevementDTO;
import ma.iorecycling.dto.DashboardKpisDTO.QuantitesParTypeDTO;
import ma.iorecycling.entity.PickupItem.TypeDechet;
import ma.iorecycling.entity.PlanningEnlevement;
import ma.iorecycling.repository.EnlevementRepository;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.PlanningEnlevementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service pour calculer les KPIs du dashboard client
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {
    
    private final EnlevementRepository enlevementRepository;
    private final PickupItemRepository pickupItemRepository;
    private final PlanningEnlevementRepository planningRepository;
    
    /**
     * Calcule tous les KPIs pour une société sur une période
     */
    public DashboardKpisDTO calculateKpis(Long societeId, LocalDate dateDebut, LocalDate dateFin) {
        log.info("Calcul des KPIs pour société {} du {} au {}", societeId, dateDebut, dateFin);
        
        // KPI 1 : Prochain enlèvement
        ProchainEnlevementDTO prochainEnlevement = getProchainEnlevement(societeId);
        
        // KPI 2 : Quantités par type
        QuantitesParTypeDTO quantites = calculateQuantitesParType(societeId, dateDebut, dateFin);
        
        // KPI 3 : Nombre d'enlèvements
        long nombreEnlevements = enlevementRepository.countBySocieteIdAndDateBetween(
                societeId, dateDebut, dateFin);
        
        // Moyenne par semaine
        long nombreJours = java.time.temporal.ChronoUnit.DAYS.between(dateDebut, dateFin) + 1;
        double nombreSemaines = nombreJours / 7.0;
        double moyenneParSemaine = nombreSemaines > 0 ? nombreEnlevements / nombreSemaines : 0;
        
        // KPI 4 : Budget recyclage
        BigDecimal budgetRecyclage = pickupItemRepository.calculateBudgetRecyclage(
                societeId, dateDebut, dateFin);
        
        // KPI 5 : Budget traitement (A_DETRUIRE = BANAL + A_DETRUIRE)
        BigDecimal budgetTraitement = pickupItemRepository.calculateBudgetTraitement(
                societeId, dateDebut, dateFin);
        
        // Bilan net
        BigDecimal bilanNet = budgetRecyclage.subtract(budgetTraitement);
        
        // Taux de recyclage
        BigDecimal poidsTotal = quantites.getTotal();
        Double tauxRecyclage = poidsTotal.compareTo(BigDecimal.ZERO) > 0
                ? quantites.getRecyclable().divide(poidsTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        
        return DashboardKpisDTO.builder()
                .prochainEnlevement(prochainEnlevement)
                .quantites(quantites)
                .nombreEnlevements(nombreEnlevements)
                .moyenneParSemaine(Math.round(moyenneParSemaine * 10) / 10.0)
                .budgetRecyclage(budgetRecyclage)
                .budgetTraitement(budgetTraitement)
                .bilanNet(bilanNet)
                .tauxRecyclage(Math.round(tauxRecyclage * 10) / 10.0)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .build();
    }
    
    /**
     * KPI 1 : Récupère le prochain enlèvement planifié
     */
    private ProchainEnlevementDTO getProchainEnlevement(Long societeId) {
        List<PlanningEnlevement> prochains = planningRepository.findProchainsEnlevements(
                societeId, LocalDate.now());
        
        if (prochains.isEmpty()) {
            return null;
        }
        
        // Prendre le premier élément (le plus proche)
        PlanningEnlevement planning = prochains.get(0);
        return ProchainEnlevementDTO.builder()
                .datePrevue(planning.getDatePrevue())
                .heurePrevue(planning.getHeurePrevue())
                .siteId(planning.getSite().getId())
                .siteNom(planning.getSite().getName())
                .build();
    }
    
    private QuantitesParTypeDTO calculateQuantitesParType(Long societeId, LocalDate dateDebut, LocalDate dateFin) {
        List<Object[]> results = pickupItemRepository.sumQuantiteByTypeForSocieteAndPeriod(
                societeId, dateDebut, dateFin);
        
        BigDecimal recyclable = BigDecimal.ZERO;
        BigDecimal banal = BigDecimal.ZERO;
        BigDecimal aDetruire = BigDecimal.ZERO;
        
        for (Object[] result : results) {
            TypeDechet type = (TypeDechet) result[0];
            BigDecimal quantite = (BigDecimal) result[1];
            
            switch (type) {
                case RECYCLABLE -> recyclable = quantite;
                case BANAL -> banal = quantite;
                case A_DETRUIRE -> aDetruire = quantite;
            }
        }
        
        BigDecimal total = recyclable.add(banal).add(aDetruire);
        
        // Calcul des pourcentages
        Double pctRecyclable = total.compareTo(BigDecimal.ZERO) > 0
                ? recyclable.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        
        Double pctBanal = total.compareTo(BigDecimal.ZERO) > 0
                ? banal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        
        Double pctADetruire = total.compareTo(BigDecimal.ZERO) > 0
                ? aDetruire.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        
        // Détail par sous-type pour RECYCLABLE
        Map<String, BigDecimal> detailRecyclable = new HashMap<>();
        List<Object[]> detailResults = pickupItemRepository.getDetailRecyclableBySousType(
                societeId, dateDebut, dateFin);
        
        for (Object[] result : detailResults) {
            String sousType = (String) result[0];
            BigDecimal quantite = (BigDecimal) result[1];
            detailRecyclable.put(sousType, quantite);
        }
        
        return QuantitesParTypeDTO.builder()
                .recyclable(recyclable)
                .banal(banal)
                .aDetruire(aDetruire)
                .total(total)
                .pourcentageRecyclable(Math.round(pctRecyclable * 10) / 10.0)
                .pourcentageBanal(Math.round(pctBanal * 10) / 10.0)
                .pourcentageADetruire(Math.round(pctADetruire * 10) / 10.0)
                .detailRecyclable(detailRecyclable)
                .build();
    }
}

