package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

/**
 * Service de stockage MinIO/S3
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {
    
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    
    @Value("${app.minio.bucket:docs}")
    private String bucketName;
    
    /**
     * Initialise le bucket au démarrage
     */
    public void initializeBucket() {
        try {
            if (!bucketExists()) {
                createBucket();
                log.info("Bucket '{}' créé avec succès", bucketName);
            } else {
                log.info("Bucket '{}' existe déjà", bucketName);
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation du bucket: {}", e.getMessage());
            throw new RuntimeException("Impossible d'initialiser le bucket MinIO", e);
        }
    }
    
    /**
     * Vérifie si le bucket existe
     */
    private boolean bucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
            return true;
        } catch (NoSuchBucketException e) {
            return false;
        }
    }
    
    /**
     * Crée le bucket
     */
    private void createBucket() {
        s3Client.createBucket(CreateBucketRequest.builder()
                .bucket(bucketName)
                .build());
    }
    
    /**
     * Upload un fichier et retourne la clé S3
     */
    public String put(Long clientId, Long pickupId, String docType, String filename, InputStream inputStream, String mimeType) {
        try {
            String objectKey = generateObjectKey(clientId, pickupId, docType, filename);
            
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(mimeType)
                    .build();
            
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, inputStream.available()));
            
            log.info("Fichier uploadé: {}", objectKey);
            return objectKey;
            
        } catch (Exception e) {
            log.error("Erreur lors de l'upload du fichier: {}", e.getMessage());
            throw new RuntimeException("Impossible d'uploader le fichier", e);
        }
    }
    
    /**
     * Génère une URL pré-signée pour télécharger un fichier
     */
    public String getPresignedUrl(String objectKey, Duration expiry) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(getObjectRequest)
                    .build();
            
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
            
        } catch (Exception e) {
            log.error("Erreur lors de la génération de l'URL pré-signée: {}", e.getMessage());
            throw new RuntimeException("Impossible de générer l'URL de téléchargement", e);
        }
    }
    
    /**
     * Génère une URL pré-signée avec une durée par défaut de 15 minutes
     */
    public String getPresignedUrl(String objectKey) {
        return getPresignedUrl(objectKey, Duration.ofMinutes(15));
    }
    
    /**
     * Génère la clé S3 pour un fichier
     */
    private String generateObjectKey(Long clientId, Long pickupId, String docType, String filename) {
        String uuid = UUID.randomUUID().toString();
        return String.format("client/%d/pickup/%d/%s-%s-%s", 
                clientId, pickupId, docType.toLowerCase(), uuid, filename);
    }
    
    /**
     * Supprime un fichier
     */
    public void delete(String objectKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build());
            
            log.info("Fichier supprimé: {}", objectKey);
            
        } catch (Exception e) {
            log.error("Erreur lors de la suppression du fichier: {}", e.getMessage());
            throw new RuntimeException("Impossible de supprimer le fichier", e);
        }
    }
}
