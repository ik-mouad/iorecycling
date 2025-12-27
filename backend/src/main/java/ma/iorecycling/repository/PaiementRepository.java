package ma.iorecycling.repository;

import ma.iorecycling.entity.Paiement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository pour l'entité Paiement
 */
@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    
    /**
     * Trouve tous les paiements d'une transaction
     */
    List<Paiement> findByTransactionId(Long transactionId);
    
    /**
     * Trouve tous les paiements d'une société (via transaction)
     */
    @Query("SELECT p FROM Paiement p WHERE p.transaction.societe.id = :societeId")
    Page<Paiement> findBySocieteId(@Param("societeId") Long societeId, Pageable pageable);
    
    /**
     * Calcule le total des paiements d'une société sur une période
     */
    @Query("SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p " +
           "WHERE p.transaction.societe.id = :societeId " +
           "AND p.datePaiement BETWEEN :dateDebut AND :dateFin " +
           "AND p.statut = 'VALIDE'")
    BigDecimal sumPaiementsBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
}

