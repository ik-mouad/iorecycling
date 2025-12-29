package ma.iorecycling.repository;

import ma.iorecycling.entity.Camion;
import ma.iorecycling.entity.TypeCamion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Camion
 */
@Repository
public interface CamionRepository extends JpaRepository<Camion, Long> {
    
    /**
     * Vérifie si un camion existe avec ce matricule
     */
    boolean existsByMatricule(String matricule);
    
    /**
     * Trouve un camion par son matricule
     */
    Optional<Camion> findByMatricule(String matricule);
    
    /**
     * Vérifie si un camion existe avec ce matricule (excluant l'ID donné pour les updates)
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
           "FROM Camion c WHERE c.matricule = :matricule AND c.id <> :id")
    boolean existsByMatriculeAndIdNot(@Param("matricule") String matricule, @Param("id") Long id);
    
    /**
     * Récupère tous les camions actifs
     */
    List<Camion> findByActifTrue();
    
    /**
     * Récupère tous les camions actifs avec pagination
     */
    Page<Camion> findByActifTrue(Pageable pageable);
    
    /**
     * Récupère les camions actifs par société propriétaire
     */
    List<Camion> findBySocieteProprietaireIdAndActifTrue(Long societeProprietaireId);
    
    /**
     * Récupère les camions par société propriétaire
     */
    Page<Camion> findBySocieteProprietaireId(Long societeProprietaireId, Pageable pageable);
    
    /**
     * Récupère les camions par type
     */
    Page<Camion> findByTypeCamion(TypeCamion typeCamion, Pageable pageable);
    
    /**
     * Récupère les camions actifs par type
     */
    List<Camion> findByTypeCamionAndActifTrue(TypeCamion typeCamion);
    
    /**
     * Filtre les camions par actif/inactif
     */
    @Query("SELECT c FROM Camion c WHERE " +
           "(:actif IS NULL OR c.actif = :actif) AND " +
           "(:societeProprietaireId IS NULL OR c.societeProprietaire.id = :societeProprietaireId) AND " +
           "(:typeCamion IS NULL OR c.typeCamion = :typeCamion)")
    Page<Camion> findWithFilters(
        @Param("actif") Boolean actif,
        @Param("societeProprietaireId") Long societeProprietaireId,
        @Param("typeCamion") TypeCamion typeCamion,
        Pageable pageable
    );
}

