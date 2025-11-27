package ma.iorecycling.repository;

import ma.iorecycling.entity.DemandeEnlevement;
import ma.iorecycling.entity.DemandeEnlevement.StatutDemande;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité DemandeEnlevement
 */
@Repository
public interface DemandeEnlevementRepository extends JpaRepository<DemandeEnlevement, Long> {
    
    /**
     * Trouve toutes les demandes d'une société
     */
    Page<DemandeEnlevement> findBySocieteIdOrderByDateCreationDesc(Long societeId, Pageable pageable);
    
    /**
     * Trouve les demandes d'une société par statut
     */
    List<DemandeEnlevement> findBySocieteIdAndStatut(Long societeId, StatutDemande statut);
    
    /**
     * Trouve toutes les demandes EN_ATTENTE (pour traitement admin)
     */
    @Query("SELECT d FROM DemandeEnlevement d WHERE d.statut = 'EN_ATTENTE' " +
           "ORDER BY d.dateCreation ASC")
    List<DemandeEnlevement> findDemandesEnAttente();
    
    /**
     * Compte les demandes EN_ATTENTE
     */
    long countByStatut(StatutDemande statut);
    
    /**
     * Trouve les demandes par statuts multiples
     */
    @Query("SELECT d FROM DemandeEnlevement d WHERE d.statut IN :statuts " +
           "ORDER BY d.dateCreation DESC")
    Page<DemandeEnlevement> findByStatutIn(@Param("statuts") List<StatutDemande> statuts, Pageable pageable);
}

