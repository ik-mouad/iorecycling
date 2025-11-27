package ma.iorecycling.repository;

import ma.iorecycling.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Site
 */
@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    
    /**
     * Trouve tous les sites d'une société
     */
    List<Site> findBySocieteId(Long societeId);
    
    /**
     * Compte le nombre de sites d'une société
     */
    long countBySocieteId(Long societeId);
}
