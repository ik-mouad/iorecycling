package ma.iorecycling.repository;

import ma.iorecycling.entity.Destination;
import ma.iorecycling.entity.TypeTraitement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Destination
 */
@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    
    /**
     * Récupère les destinations pouvant traiter les déchets dangereux
     */
    @Query("SELECT DISTINCT d FROM Destination d JOIN d.typesTraitement t WHERE " +
           "t IN (ma.iorecycling.entity.TypeTraitement.INCINERATION, " +
           "ma.iorecycling.entity.TypeTraitement.ENFOUISSEMENT, " +
           "ma.iorecycling.entity.TypeTraitement.DENATURATION_DESTRUCTION, " +
           "ma.iorecycling.entity.TypeTraitement.TRAITEMENT)")
    List<Destination> findDestinationsPourDechetsDangereux();
    
    /**
     * Récupère les destinations par type de traitement
     */
    @Query("SELECT DISTINCT d FROM Destination d JOIN d.typesTraitement t WHERE t = :typeTraitement")
    Page<Destination> findByTypeTraitement(@Param("typeTraitement") TypeTraitement typeTraitement, Pageable pageable);
    
    /**
     * Recherche par raison sociale ou site
     */
    @Query("SELECT d FROM Destination d WHERE " +
           "LOWER(d.raisonSociale) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.site) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Destination> search(@Param("search") String search, Pageable pageable);
}

