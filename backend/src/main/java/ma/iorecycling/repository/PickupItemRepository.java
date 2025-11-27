package ma.iorecycling.repository;

import ma.iorecycling.entity.PickupItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository pour l'entité PickupItem
 */
@Repository
public interface PickupItemRepository extends JpaRepository<PickupItem, Long> {
    
    /**
     * Trouve tous les items d'un enlèvement
     */
    List<PickupItem> findByEnlevementId(Long enlevementId);
    
    /**
     * Supprime tous les items d'un enlèvement
     */
    void deleteByEnlevementId(Long enlevementId);
    
    /**
     * Calcule la quantité totale par type de déchet pour une société sur une période
     */
    @Query("SELECT i.typeDechet, SUM(i.quantiteKg) " +
           "FROM PickupItem i JOIN i.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "GROUP BY i.typeDechet")
    List<Object[]> sumQuantiteByTypeForSocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le budget total par type de déchet pour une société sur une période
     */
    @Query("SELECT i.typeDechet, SUM(i.montantMad) " +
           "FROM PickupItem i JOIN i.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "GROUP BY i.typeDechet")
    List<Object[]> sumMontantByTypeForSocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le budget de valorisation (VALORISABLE uniquement)
     */
    @Query("SELECT COALESCE(SUM(i.montantMad), 0) " +
           "FROM PickupItem i JOIN i.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "AND i.typeDechet = 'VALORISABLE'")
    BigDecimal calculateBudgetValorisation(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le budget A ELIMINER (BANAL + A_ELIMINER)
     */
    @Query("SELECT COALESCE(SUM(i.montantMad), 0) " +
           "FROM PickupItem i JOIN i.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "AND i.typeDechet IN ('BANAL', 'A_ELIMINER')")
    BigDecimal calculateBudgetTraitement(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Détail par sous-type pour les VALORISABLE
     */
    @Query("SELECT i.sousType, SUM(i.quantiteKg), SUM(i.montantMad) " +
           "FROM PickupItem i JOIN i.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "AND i.typeDechet = 'VALORISABLE' " +
           "GROUP BY i.sousType " +
           "ORDER BY SUM(i.quantiteKg) DESC")
    List<Object[]> getDetailValorisableBySousType(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
}
