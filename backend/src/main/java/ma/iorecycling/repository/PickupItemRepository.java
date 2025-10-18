package ma.iorecycling.repository;

import ma.iorecycling.entity.PickupItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.List;
import ma.iorecycling.entity.PickupType;

/**
 * Repository pour la gestion des items d'enlèvement
 */
@Repository
public interface PickupItemRepository extends JpaRepository<PickupItem, Long> {
    
    /**
     * Trouve tous les items d'un enlèvement
     */
    List<PickupItem> findByPickupIdOrderByMaterial(Long pickupId);
    
    /**
     * Trouve tous les items d'un client pour un mois donné
     */
    @Query("""
        SELECT pi FROM PickupItem pi 
        JOIN pi.pickup p 
        WHERE p.client.id = :clientId 
        AND EXTRACT(YEAR FROM p.date) = :year 
        AND EXTRACT(MONTH FROM p.date) = :month
        ORDER BY pi.material
        """)
    List<PickupItem> findByClientIdAndMonth(@Param("clientId") Long clientId, 
                                           @Param("year") int year, 
                                           @Param("month") int month);
    
    /**
     * Calcule le total des revenus pour un client et un mois
     */
    @Query("""
        SELECT COALESCE(SUM(pi.totalMad), 0) FROM PickupItem pi 
        JOIN pi.pickup p 
        WHERE p.client.id = :clientId 
        AND EXTRACT(YEAR FROM p.date) = :year 
        AND EXTRACT(MONTH FROM p.date) = :month
        """)
    BigDecimal calculateTotalRevenueForMonth(@Param("clientId") Long clientId, 
                                           @Param("year") int year, 
                                           @Param("month") int month);
    
    /**
     * Trouve les matériaux uniques avec leurs totaux pour un client et un mois
     */
    @Query("""
        SELECT pi.material, 
               SUM(pi.qtyKg) as totalQty, 
               AVG(pi.priceMadPerKg) as avgPrice,
               SUM(pi.totalMad) as totalMad
        FROM PickupItem pi 
        JOIN pi.pickup p 
        WHERE p.client.id = :clientId 
        AND EXTRACT(YEAR FROM p.date) = :year 
        AND EXTRACT(MONTH FROM p.date) = :month
        GROUP BY pi.material
        ORDER BY pi.material
        """)
    List<Object[]> findMaterialSummaryForMonth(@Param("clientId") Long clientId, 
                                             @Param("year") int year, 
                                             @Param("month") int month);
    
    /**
     * Trouve les items d'un client pour une période et un type donnés
     */
    @Query("""
        SELECT pi FROM PickupItem pi 
        JOIN pi.pickup p 
        WHERE p.client.id = :clientId 
        AND p.date BETWEEN :from AND :to
        AND p.type = :type
        ORDER BY pi.material
        """)
    List<PickupItem> findByPickupClientIdAndPickupDateBetweenAndPickupType(
        @Param("clientId") Long clientId,
        @Param("from") Instant from,
        @Param("to") Instant to,
        @Param("type") PickupType type
    );
    
    /**
     * Supprime tous les items d'un enlèvement
     */
    void deleteByPickupId(Long pickupId);
}