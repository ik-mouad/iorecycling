package ma.iorecycling.repository;

import ma.iorecycling.entity.Societe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Societe
 */
@Repository
public interface SocieteRepository extends JpaRepository<Societe, Long> {
    
    /**
     * Vérifie si une société existe avec cet ICE
     */
    boolean existsByIce(String ice);
    
    /**
     * Trouve une société par son ICE
     */
    Optional<Societe> findByIce(String ice);
    
    /**
     * Vérifie si une société existe avec cet ICE (excluant l'ID donné pour les updates)
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM Societe s WHERE s.ice = :ice AND s.id <> :id")
    boolean existsByIceAndIdNot(@Param("ice") String ice, @Param("id") Long id);
    
    /**
     * Compte le nombre de sociétés actives (ayant au moins un enlèvement)
     */
    @Query("SELECT COUNT(DISTINCT e.societe.id) FROM Enlevement e")
    long countActiveSocietes();
}

