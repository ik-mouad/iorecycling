package ma.iorecycling.repository;

import ma.iorecycling.entity.Echeance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository pour l'entité Echeance
 */
@Repository
public interface EcheanceRepository extends JpaRepository<Echeance, Long> {
    
    /**
     * Trouve toutes les échéances d'une transaction
     */
    List<Echeance> findByTransactionId(Long transactionId);
    
    /**
     * Trouve les échéances en retard d'une société
     */
    @Query("SELECT e FROM Echeance e WHERE e.transaction.societe.id = :societeId " +
           "AND e.dateEcheance < :dateLimite " +
           "AND e.statut = 'EN_ATTENTE' " +
           "ORDER BY e.dateEcheance ASC")
    List<Echeance> findEcheancesEnRetard(
            @Param("societeId") Long societeId,
            @Param("dateLimite") LocalDate dateLimite);
    
    /**
     * Trouve les échéances à venir d'une société
     */
    @Query("SELECT e FROM Echeance e WHERE e.transaction.societe.id = :societeId " +
           "AND e.dateEcheance >= :dateDebut " +
           "AND e.dateEcheance <= :dateFin " +
           "AND e.statut = 'EN_ATTENTE' " +
           "ORDER BY e.dateEcheance ASC")
    List<Echeance> findEcheancesAVenir(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
}

