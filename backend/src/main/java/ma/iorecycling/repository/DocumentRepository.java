package ma.iorecycling.repository;

import ma.iorecycling.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des documents
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    /**
     * Trouve tous les documents d'un enlèvement
     */
    List<Document> findByPickupIdOrderByCreatedAtDesc(Long pickupId);
    
    /**
     * Trouve un document par sa clé S3
     */
    Optional<Document> findByObjectKey(String objectKey);
    
    /**
     * Trouve les documents par type
     */
    List<Document> findByPickupIdAndDocTypeOrderByCreatedAtDesc(Long pickupId, Document.DocumentType docType);
    
    /**
     * Compte les documents d'un enlèvement
     */
    long countByPickupId(Long pickupId);
    
    /**
     * Trouve tous les documents d'un client
     */
    @Query("""
        SELECT d FROM Document d 
        JOIN d.pickup p 
        WHERE p.client.id = :clientId 
        ORDER BY d.createdAt DESC
        """)
    List<Document> findByClientId(@Param("clientId") Long clientId);
    
    /**
     * Trouve les documents par type pour un client
     */
    @Query("""
        SELECT d FROM Document d 
        JOIN d.pickup p 
        WHERE p.client.id = :clientId 
        AND d.docType = :docType
        ORDER BY d.createdAt DESC
        """)
    List<Document> findByClientIdAndDocType(@Param("clientId") Long clientId, 
                                          @Param("docType") Document.DocumentType docType);
}