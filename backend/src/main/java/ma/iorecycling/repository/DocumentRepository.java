package ma.iorecycling.repository;

import ma.iorecycling.entity.Document;
import ma.iorecycling.entity.Document.TypeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Document
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    /**
     * Trouve les documents d'un enlèvement
     */
    List<Document> findByEnlevementIdOrderByUploadedAtDesc(Long enlevementId);
    
    /**
     * Trouve les documents d'un enlèvement par type
     */
    List<Document> findByEnlevementIdAndTypeDocument(Long enlevementId, TypeDocument typeDocument);
    
    /**
     * Trouve les documents mensuels d'une société
     */
    @Query("SELECT d FROM Document d WHERE d.societe.id = :societeId " +
           "AND d.periodeMois IS NOT NULL " +
           "ORDER BY d.periodeMois DESC, d.typeDocument")
    List<Document> findDocumentsMensuelsBySociete(@Param("societeId") Long societeId);
    
    /**
     * Trouve les documents mensuels d'une société pour une période
     */
    List<Document> findBySocieteIdAndPeriodeMoisOrderByTypeDocument(Long societeId, String periodeMois);
    
    /**
     * Trouve les documents d'enlèvement d'une société (BSDI et PV)
     */
    @Query("SELECT d FROM Document d WHERE d.societe.id = :societeId " +
           "AND d.enlevement IS NOT NULL " +
           "AND d.typeDocument IN ('BSDI', 'PV_DESTRUCTION') " +
           "ORDER BY d.enlevement.dateEnlevement DESC")
    List<Document> findDocumentsEnlevementBySociete(@Param("societeId") Long societeId);
    
    /**
     * Vérifie si un enlèvement a un BSDI
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END " +
           "FROM Document d WHERE d.enlevement.id = :enlevementId " +
           "AND d.typeDocument = 'BSDI'")
    boolean existsBsdiForEnlevement(@Param("enlevementId") Long enlevementId);
    
    /**
     * Vérifie si un enlèvement a un PV de destruction
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END " +
           "FROM Document d WHERE d.enlevement.id = :enlevementId " +
           "AND d.typeDocument = 'PV_DESTRUCTION'")
    boolean existsPvForEnlevement(@Param("enlevementId") Long enlevementId);
    
    /**
     * Trouve tous les documents d'une société (enlèvement + mensuels)
     */
    List<Document> findBySocieteIdOrderByUploadedAtDesc(Long societeId);
}
