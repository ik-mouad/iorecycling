package ma.iorecycling.repository;

import ma.iorecycling.entity.VenteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité VenteItem
 */
@Repository
public interface VenteItemRepository extends JpaRepository<VenteItem, Long> {
    
    /**
     * Trouve tous les items d'une vente
     */
    List<VenteItem> findByVenteId(Long venteId);
    
    /**
     * Trouve tous les items liés à un pickup_item
     */
    List<VenteItem> findByPickupItemId(Long pickupItemId);
    
    /**
     * Trouve les items par type de déchet
     */
    @Query("SELECT vi FROM VenteItem vi WHERE vi.typeDechet = :typeDechet " +
           "AND vi.vente.statut = 'VALIDEE'")
    List<VenteItem> findByTypeDechet(@Param("typeDechet") String typeDechet);
}

