package ma.iorecycling.repository;

import ma.iorecycling.entity.Enlevement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Enlevement
 */
@Repository
public interface EnlevementRepository extends JpaRepository<Enlevement, Long> {
    
    /**
     * Trouve un enlèvement par son numéro
     */
    Optional<Enlevement> findByNumeroEnlevement(String numeroEnlevement);
    
    /**
     * Trouve tous les enlèvements d'une société
     */
    Page<Enlevement> findBySocieteId(Long societeId, Pageable pageable);
    
    /**
     * Trouve tous les enlèvements d'un site
     */
    Page<Enlevement> findBySiteId(Long siteId, Pageable pageable);
    
    /**
     * Trouve les enlèvements d'une société entre deux dates
     */
    @Query("SELECT e FROM Enlevement e WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY e.dateEnlevement DESC")
    List<Enlevement> findBySocieteIdAndDateBetween(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Compte le nombre d'enlèvements d'une société entre deux dates
     */
    @Query("SELECT COUNT(e) FROM Enlevement e WHERE e.societe.id = :societeId " +
           "AND e.dateEnlevement BETWEEN :dateDebut AND :dateFin")
    long countBySocieteIdAndDateBetween(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Trouve les enlèvements contenant des déchets A_ELIMINER sans BSDI ou PV
     */
    @Query("SELECT DISTINCT e FROM Enlevement e " +
           "JOIN e.items i " +
           "WHERE i.typeDechet = 'A_ELIMINER' " +
           "AND (NOT EXISTS (SELECT d FROM Document d WHERE d.enlevement.id = e.id AND d.typeDocument = 'BSDI') " +
           "OR NOT EXISTS (SELECT d FROM Document d WHERE d.enlevement.id = e.id AND d.typeDocument = 'PV_DESTRUCTION'))")
    List<Enlevement> findEnlevementsWithMissingDocuments();
}

