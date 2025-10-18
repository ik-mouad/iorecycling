package ma.iorecycling.repository;

import ma.iorecycling.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des sites
 */
@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    
    /**
     * Trouve tous les sites d'un client
     */
    List<Site> findByClientIdOrderByName(Long clientId);
    
    /**
     * Trouve un site par client et nom
     */
    Optional<Site> findByClientIdAndName(Long clientId, String name);
    
    /**
     * Compte le nombre de sites d'un client
     */
    long countByClientId(Long clientId);
    
    /**
     * Trouve le site principal d'un client (le premier créé)
     */
    @Query("SELECT s FROM Site s WHERE s.clientId = :clientId ORDER BY s.createdAt ASC")
    Optional<Site> findPrimarySiteByClientId(@Param("clientId") Long clientId);
}