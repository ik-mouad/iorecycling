package ma.iorecycling.repository;

import ma.iorecycling.entity.Pickup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupRepository extends JpaRepository<Pickup, Long> {
    
    List<Pickup> findByClientId(Long clientId);
    
    @Query("SELECT COUNT(p) FROM Pickup p WHERE p.client.id = :clientId")
    Long countByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgValorisables), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgValorisablesByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgBanals), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgBanalsByClientId(@Param("clientId") Long clientId);
    
    @Query("SELECT COALESCE(SUM(p.kgDangereux), 0) FROM Pickup p WHERE p.client.id = :clientId")
    Double sumKgDangereuxByClientId(@Param("clientId") Long clientId);
}
