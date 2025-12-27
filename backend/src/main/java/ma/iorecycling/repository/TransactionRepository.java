package ma.iorecycling.repository;

import ma.iorecycling.entity.Transaction;
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
 * Repository pour l'entité Transaction
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * Trouve toutes les transactions d'une société
     */
    Page<Transaction> findBySocieteId(Long societeId, Pageable pageable);
    
    /**
     * Trouve les transactions d'une société par type
     */
    Page<Transaction> findBySocieteIdAndType(Long societeId, Transaction.TypeTransaction type, Pageable pageable);
    
    /**
     * Trouve les transactions d'une société entre deux dates
     */
    @Query("SELECT t FROM Transaction t WHERE t.societe.id = :societeId " +
           "AND t.dateTransaction BETWEEN :dateDebut AND :dateFin " +
           "ORDER BY t.dateTransaction DESC")
    List<Transaction> findBySocieteIdAndDateBetween(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le total des recettes d'une société sur une période
     */
    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t " +
           "WHERE t.societe.id = :societeId " +
           "AND t.type = 'RECETTE' " +
           "AND t.dateTransaction BETWEEN :dateDebut AND :dateFin")
    BigDecimal sumRecettesBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le total des dépenses d'une société sur une période
     */
    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t " +
           "WHERE t.societe.id = :societeId " +
           "AND t.type = 'DEPENSE' " +
           "AND t.dateTransaction BETWEEN :dateDebut AND :dateFin")
    BigDecimal sumDepensesBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Trouve les transactions avec échéances en retard
     */
    @Query("SELECT DISTINCT t FROM Transaction t " +
           "JOIN t.echeances e " +
           "WHERE t.societe.id = :societeId " +
           "AND e.dateEcheance < :dateLimite " +
           "AND e.statut = 'EN_ATTENTE'")
    List<Transaction> findTransactionsWithEcheancesEnRetard(
            @Param("societeId") Long societeId,
            @Param("dateLimite") LocalDate dateLimite);
    
    /**
     * Trouve les transactions impayées (montant restant > 0)
     */
    @Query("SELECT t FROM Transaction t WHERE t.societe.id = :societeId " +
           "AND t.statut != 'ANNULEE' " +
           "AND (SELECT COALESCE(SUM(p.montant), 0) FROM Paiement p WHERE p.transaction.id = t.id) < t.montant")
    List<Transaction> findTransactionsImpayees(@Param("societeId") Long societeId);
    
    /**
     * Trouve toutes les transactions d'un enlèvement
     */
    List<Transaction> findByEnlevementId(Long enlevementId);
    
    /**
     * Calcule le CA Prestation d'une société sur une période
     */
    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t " +
           "WHERE t.societe.id = :societeId " +
           "AND t.type = 'RECETTE' " +
           "AND t.typeRecette = 'PRESTATION' " +
           "AND t.dateTransaction BETWEEN :dateDebut AND :dateFin")
    BigDecimal sumCAPrestationBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
    
    /**
     * Calcule le CA Vente Matière d'une société sur une période
     */
    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t " +
           "WHERE t.societe.id = :societeId " +
           "AND t.type = 'RECETTE' " +
           "AND t.typeRecette = 'VENTE_MATIERE' " +
           "AND t.dateTransaction BETWEEN :dateDebut AND :dateFin")
    BigDecimal sumCAVenteMatiereBySocieteAndPeriod(
            @Param("societeId") Long societeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);
}

