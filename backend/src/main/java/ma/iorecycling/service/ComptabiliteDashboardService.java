package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.ComptabiliteDashboardDTO;
import ma.iorecycling.dto.ComptabiliteDashboardDTO.EvolutionMensuelleDTO;
import ma.iorecycling.entity.Transaction;
import ma.iorecycling.repository.EcheanceRepository;
import ma.iorecycling.repository.PaiementRepository;
import ma.iorecycling.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service pour calculer les KPIs du dashboard de comptabilité
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ComptabiliteDashboardService {
    
    private final TransactionRepository transactionRepository;
    private final PaiementRepository paiementRepository;
    private final EcheanceRepository echeanceRepository;
    
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_LIBELLE_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH);
    
    /**
     * Calcule tous les KPIs pour une société sur une période
     */
    public ComptabiliteDashboardDTO calculateDashboard(Long societeId, LocalDate dateDebut, LocalDate dateFin, String periode) {
        log.info("Calcul du dashboard comptabilité pour société {} du {} au {}", societeId, dateDebut, dateFin);
        
        // Totaux recettes et dépenses
        BigDecimal totalRecettes = transactionRepository.sumRecettesBySocieteAndPeriod(
                societeId, dateDebut, dateFin);
        BigDecimal totalDepenses = transactionRepository.sumDepensesBySocieteAndPeriod(
                societeId, dateDebut, dateFin);
        
        // Résultat net
        BigDecimal resultatNet = totalRecettes.subtract(totalDepenses);
        
        // Paiements reçus
        BigDecimal totalPaiementsRecus = paiementRepository.sumPaiementsBySocieteAndPeriod(
                societeId, dateDebut, dateFin);
        
        // Transactions impayées
        List<Transaction> transactionsImpayees = transactionRepository.findTransactionsImpayees(societeId);
        BigDecimal totalImpayes = transactionsImpayees.stream()
                .map(Transaction::getMontantRestant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Échéances en retard
        LocalDate aujourdhui = LocalDate.now();
        List<ma.iorecycling.entity.Echeance> echeancesEnRetard = echeanceRepository.findEcheancesEnRetard(societeId, aujourdhui);
        BigDecimal montantEcheancesEnRetard = echeancesEnRetard.stream()
                .map(ma.iorecycling.entity.Echeance::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Échéances à venir (30 prochains jours)
        LocalDate dateFinAVenir = aujourdhui.plusDays(30);
        List<ma.iorecycling.entity.Echeance> echeancesAVenir = echeanceRepository.findEcheancesAVenir(
                societeId, aujourdhui, dateFinAVenir);
        BigDecimal montantEcheancesAVenir = echeancesAVenir.stream()
                .map(ma.iorecycling.entity.Echeance::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Répartition des dépenses par catégorie
        Map<String, BigDecimal> depensesParCategorie = calculateDepensesParCategorie(societeId, dateDebut, dateFin);
        
        // Évolution mensuelle (12 derniers mois)
        List<EvolutionMensuelleDTO> evolutionMensuelle = calculateEvolutionMensuelle(societeId);
        
        // Calcul des évolutions (comparaison avec période précédente)
        LocalDate periodePrecedenteDebut = dateDebut.minusMonths(periode.equals("mensuel") ? 1 : 
                                                                  periode.equals("trimestriel") ? 3 : 12);
        LocalDate periodePrecedenteFin = dateDebut.minusDays(1);
        
        BigDecimal recettesPrecedentes = transactionRepository.sumRecettesBySocieteAndPeriod(
                societeId, periodePrecedenteDebut, periodePrecedenteFin);
        BigDecimal depensesPrecedentes = transactionRepository.sumDepensesBySocieteAndPeriod(
                societeId, periodePrecedenteDebut, periodePrecedenteFin);
        BigDecimal resultatPrecedent = recettesPrecedentes.subtract(depensesPrecedentes);
        
        Double evolutionRecettesPct = calculateEvolutionPct(totalRecettes, recettesPrecedentes);
        Double evolutionDepensesPct = calculateEvolutionPct(totalDepenses, depensesPrecedentes);
        Double evolutionResultatPct = calculateEvolutionPct(resultatNet, resultatPrecedent);
        
        // Trésorerie (approximation : total recettes - total dépenses depuis le début)
        BigDecimal tresorerie = calculateTresorerie(societeId);
        
        return ComptabiliteDashboardDTO.builder()
                .totalRecettes(totalRecettes)
                .totalDepenses(totalDepenses)
                .resultatNet(resultatNet)
                .tresorerie(tresorerie)
                .evolutionRecettesPct(evolutionRecettesPct)
                .evolutionDepensesPct(evolutionDepensesPct)
                .evolutionResultatPct(evolutionResultatPct)
                .totalPaiementsRecus(totalPaiementsRecus)
                .totalImpayes(totalImpayes)
                .nombreTransactionsImpayees((long) transactionsImpayees.size())
                .nombreEcheancesEnRetard((long) echeancesEnRetard.size())
                .montantEcheancesEnRetard(montantEcheancesEnRetard)
                .nombreEcheancesAVenir((long) echeancesAVenir.size())
                .montantEcheancesAVenir(montantEcheancesAVenir)
                .depensesParCategorie(depensesParCategorie)
                .evolutionMensuelle(evolutionMensuelle)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .periode(periode)
                .build();
    }
    
    /**
     * Calcule la répartition des dépenses par catégorie
     */
    private Map<String, BigDecimal> calculateDepensesParCategorie(Long societeId, LocalDate dateDebut, LocalDate dateFin) {
        List<Transaction> depenses = transactionRepository.findBySocieteIdAndDateBetween(
                societeId, dateDebut, dateFin).stream()
                .filter(t -> t.getType() == Transaction.TypeTransaction.DEPENSE)
                .collect(Collectors.toList());
        
        Map<String, BigDecimal> result = new HashMap<>();
        for (Transaction transaction : depenses) {
            String categorie = transaction.getCategorie() != null ? transaction.getCategorie() : "Autre";
            result.merge(categorie, transaction.getMontant(), BigDecimal::add);
        }
        
        return result;
    }
    
    /**
     * Calcule l'évolution mensuelle sur 12 mois
     */
    private List<EvolutionMensuelleDTO> calculateEvolutionMensuelle(Long societeId) {
        List<EvolutionMensuelleDTO> result = new ArrayList<>();
        LocalDate maintenant = LocalDate.now();
        
        for (int i = 11; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.from(maintenant.minusMonths(i));
            LocalDate debutMois = yearMonth.atDay(1);
            LocalDate finMois = yearMonth.atEndOfMonth();
            
            BigDecimal recettes = transactionRepository.sumRecettesBySocieteAndPeriod(
                    societeId, debutMois, finMois);
            BigDecimal depenses = transactionRepository.sumDepensesBySocieteAndPeriod(
                    societeId, debutMois, finMois);
            BigDecimal resultat = recettes.subtract(depenses);
            
            result.add(EvolutionMensuelleDTO.builder()
                    .mois(yearMonth.format(MONTH_FORMATTER))
                    .moisLibelle(debutMois.format(MONTH_LIBELLE_FORMATTER))
                    .recettes(recettes)
                    .depenses(depenses)
                    .resultat(resultat)
                    .build());
        }
        
        return result;
    }
    
    /**
     * Calcule le pourcentage d'évolution
     */
    private Double calculateEvolutionPct(BigDecimal valeurActuelle, BigDecimal valeurPrecedente) {
        if (valeurPrecedente.compareTo(BigDecimal.ZERO) == 0) {
            return valeurActuelle.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal diff = valeurActuelle.subtract(valeurPrecedente);
        return diff.divide(valeurPrecedente, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
    
    /**
     * Calcule la trésorerie (approximation)
     */
    private BigDecimal calculateTresorerie(Long societeId) {
        // Total recettes depuis toujours
        LocalDate dateDebut = LocalDate.of(2000, 1, 1);
        LocalDate dateFin = LocalDate.now();
        BigDecimal totalRecettes = transactionRepository.sumRecettesBySocieteAndPeriod(
                societeId, dateDebut, dateFin);
        BigDecimal totalDepenses = transactionRepository.sumDepensesBySocieteAndPeriod(
                societeId, dateDebut, dateFin);
        
        return totalRecettes.subtract(totalDepenses);
    }
}

