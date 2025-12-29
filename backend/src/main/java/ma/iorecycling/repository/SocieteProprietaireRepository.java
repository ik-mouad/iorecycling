package ma.iorecycling.repository;

import ma.iorecycling.entity.SocieteProprietaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité SocieteProprietaire
 */
@Repository
public interface SocieteProprietaireRepository extends JpaRepository<SocieteProprietaire, Long> {
    
    /**
     * Récupère toutes les sociétés propriétaires actives
     */
    List<SocieteProprietaire> findByActifTrue();
    
    /**
     * Recherche par raison sociale
     */
    @Query("SELECT s FROM SocieteProprietaire s WHERE " +
           "LOWER(s.raisonSociale) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<SocieteProprietaire> search(@Param("search") String search, Pageable pageable);
}

