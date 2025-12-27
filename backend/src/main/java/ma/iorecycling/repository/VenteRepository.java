package ma.iorecycling.repository;

import ma.iorecycling.entity.Vente;
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
 * Repository pour l'entité Vente
 */
@Repository
public interface VenteRepository extends JpaRepository<Vente, Long> {
    
    /**
     * Trouve une vente par son numéro
     */
    Optional<Vente> findByNumeroVente(String numeroVente);
    
    /**
     * Trouve toutes les ventes d'un acheteur
     */
    List<Vente> findByAcheteurId(Long acheteurId);
    
    /**
     * Trouve les ventes par statut
     */
    Page<Vente> findByStatut(Vente.StatutVente statut, Pageable pageable);
    
    /**
     * Trouve les ventes entre deux dates
     */
    @Query("SELECT v FROM Vente v WHERE v.dateVente BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY v.dateVente DESC")
    List<Vente> findByDateBetween(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Trouve les ventes validées d'une société (via les items)
     */
    @Query("SELECT DISTINCT v FROM Vente v " +
           "JOIN v.items vi " +
           "JOIN vi.pickupItem pi " +
           "JOIN pi.enlevement e " +
           "WHERE e.societe.id = :societeId " +
           "AND v.statut = 'VALIDEE' " +
           "AND v.dateVente BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY v.dateVente DESC")
    List<Vente> findVentesBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
}

