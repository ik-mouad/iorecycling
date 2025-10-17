package ma.iorecycling.repository;

import ma.iorecycling.entity.Pickup;
import ma.iorecycling.entity.PickupType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PickupRepository extends JpaRepository<Pickup, Long> {
    
    List<Pickup> findByClientId(Long clientId);
    
    @Query("SELECT COUNT(p) FROM Pickup p WHERE p.client.id = :clientId")
    Long countByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgValorisables), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgValorisablesByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgBanals), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgBanalsByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgDangereux), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgDangereuxByClientId(@Param("clientId") Long clientId);
    
    // Nouvelles méthodes pour le tableau de bord
    
    /**
     * Trouve les enlèvements d'un client triés par date décroissante
     */
    List<Pickup> findByClientIdOrderByDateDesc(Long clientId);
    
    /**
     * Trouve les enlèvements d'un client avec pagination, triés par date décroissante
     */
    Page<Pickup> findByClientIdOrderByDateDesc(Long clientId, Pageable pageable);
    
    /**
     * Trouve les enlèvements d'un client par type avec pagination, triés par date décroissante
     */
    Page<Pickup> findByClientIdAndTypeOrderByDateDesc(Long clientId, PickupType type, Pageable pageable);
    
    /**
     * Trouve les enlèvements d'un client pour une période donnée
     */
    List<Pickup> findByClientIdAndDateBetween(Long clientId, Instant from, Instant to);
    
    /**
     * Trouve les enlèvements d'un client par type pour une période donnée
     */
    List<Pickup> findByClientIdAndTypeAndDateBetween(Long clientId, PickupType type, Instant from, Instant to);
    
    /**
     * Trouve les enlèvements avec leurs documents et site (pour éviter N+1)
     */
    @Query("SELECT p FROM Pickup p " +
           "LEFT JOIN FETCH p.documents " +
           "LEFT JOIN FETCH p.site " +
           "WHERE p.client.id = :clientId " +
           "ORDER BY p.date DESC")
    List<Pickup> findByClientIdWithDocumentsAndSite(@Param("clientId") Long clientId);
    
    /**
     * Trouve les enlèvements avec pagination et fetch des associations
     */
    @Query(value = "SELECT p FROM Pickup p " +
                   "LEFT JOIN FETCH p.documents " +
                   "LEFT JOIN FETCH p.site " +
                   "WHERE p.client.id = :clientId " +
                   "ORDER BY p.date DESC",
           countQuery = "SELECT COUNT(p) FROM Pickup p WHERE p.client.id = :clientId")
    Page<Pickup> findByClientIdWithDocumentsAndSite(@Param("clientId") Long clientId, Pageable pageable);
}
