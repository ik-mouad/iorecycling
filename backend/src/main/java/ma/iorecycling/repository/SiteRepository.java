package ma.iorecycling.repository;

import ma.iorecycling.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    
    /**
     * Trouve tous les sites d'un client
     */
    List<Site> findByClientId(Long clientId);
    
    /**
     * Trouve un site par client et nom
     */
    @Query("SELECT s FROM Site s WHERE s.client.id = :clientId AND s.name = :name")
    Site findByClientIdAndName(@Param("clientId") Long clientId, @Param("name") String name);
}
