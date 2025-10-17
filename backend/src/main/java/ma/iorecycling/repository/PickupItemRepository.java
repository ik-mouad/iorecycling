package ma.iorecycling.repository;

import ma.iorecycling.entity.PickupItem;
import ma.iorecycling.entity.PickupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PickupItemRepository extends JpaRepository<PickupItem, Long> {
    
    /**
     * Trouve tous les items d'un enlèvement
     */
    List<PickupItem> findByPickupId(Long pickupId);
    
    /**
     * Trouve les items valorisables d'un client pour une période et un type
     */
    @Query("SELECT pi FROM PickupItem pi WHERE pi.pickup.client.id = :clientId " +
           "AND pi.pickup.date BETWEEN :from AND :to " +
           "AND pi.pickup.type = :type")
    List<PickupItem> findByPickupClientIdAndPickupDateBetweenAndPickupType(
        @Param("clientId") Long clientId, 
        @Param("from") Instant from, 
        @Param("to") Instant to, 
        @Param("type") PickupType type
    );
    
    /**
     * Trouve les items valorisables d'un client pour une période (tous types)
     */
    @Query("SELECT pi FROM PickupItem pi WHERE pi.pickup.client.id = :clientId " +
           "AND pi.pickup.date BETWEEN :from AND :to")
    List<PickupItem> findByPickupClientIdAndPickupDateBetween(
        @Param("clientId") Long clientId, 
        @Param("from") Instant from, 
        @Param("to") Instant to
    );
}
