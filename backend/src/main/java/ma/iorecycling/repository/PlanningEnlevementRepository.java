package ma.iorecycling.repository;

import ma.iorecycling.entity.PlanningEnlevement;
import ma.iorecycling.entity.PlanningEnlevement.StatutPlanning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository pour l'entité PlanningEnlevement
 */
@Repository
public interface PlanningEnlevementRepository extends JpaRepository<PlanningEnlevement, Long> {
    
    /**
     * Trouve le prochain enlèvement planifié pour une société (KPI 1)
     * Retourne une liste triée par date et heure, le premier élément est le prochain
     */
    @Query("SELECT p FROM PlanningEnlevement p WHERE p.societe.id = :societeId " +
           "AND p.datePrevue >= :dateAujourdhui " +
           "AND p.statut IN ('PLANIFIE', 'CONFIRME') " +
           "ORDER BY p.datePrevue ASC, p.heurePrevue ASC")
    List<PlanningEnlevement> findProchainsEnlevements(
            @Param("societeId") Long societeId,
            @Param("dateAujourdhui") LocalDate dateAujourdhui);
    
    /**
     * Trouve les enlèvements planifiés d'un mois
     */
    @Query("SELECT p FROM PlanningEnlevement p WHERE p.datePrevue BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY p.datePrevue ASC, p.heurePrevue ASC")
    List<PlanningEnlevement> findByMois(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Trouve les enlèvements planifiés d'une société pour un mois
     */
    @Query("SELECT p FROM PlanningEnlevement p WHERE p.societe.id = :societeId " +
           "AND p.datePrevue BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY p.datePrevue ASC")
    List<PlanningEnlevement> findBySocieteAndMois(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Trouve les enlèvements planifiés d'un jour
     */
    List<PlanningEnlevement> findByDatePrevueOrderByHeurePrevueAsc(LocalDate datePrevue);
    
    /**
     * Compte les enlèvements planifiés d'une société
     */
    long countBySocieteIdAndStatutIn(Long societeId, List<StatutPlanning> statuts);
}

