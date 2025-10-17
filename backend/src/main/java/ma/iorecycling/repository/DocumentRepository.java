package ma.iorecycling.repository;

import ma.iorecycling.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    /**
     * Trouve tous les documents d'un enlèvement
     */
    List<Document> findByPickupId(Long pickupId);
    
    /**
     * Trouve tous les documents d'un client
     */
    @Query("SELECT d FROM Document d WHERE d.pickup.client.id = :clientId")
    List<Document> findByPickupClientId(@Param("clientId") Long clientId);
    
    /**
     * Trouve les documents par type pour un client
     */
    @Query("SELECT d FROM Document d WHERE d.pickup.client.id = :clientId AND d.docType = :docType")
    List<Document> findByPickupClientIdAndDocType(@Param("clientId") Long clientId, @Param("docType") String docType);
}
