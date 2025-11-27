package ma.iorecycling.repository;

import ma.iorecycling.entity.Recurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Recurrence
 */
@Repository
public interface RecurrenceRepository extends JpaRepository<Recurrence, Long> {
    
    /**
     * Trouve toutes les récurrences actives
     */
    List<Recurrence> findByActiveTrue();
    
    /**
     * Trouve les récurrences d'une société
     */
    List<Recurrence> findBySocieteId(Long societeId);
    
    /**
     * Trouve les récurrences actives d'une société
     */
    List<Recurrence> findBySocieteIdAndActiveTrue(Long societeId);
    
    /**
     * Compte les récurrences actives
     */
    long countByActiveTrue();
}

