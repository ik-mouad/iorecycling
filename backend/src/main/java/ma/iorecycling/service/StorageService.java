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
    
    @Value("${app.minio.endpoint:http://minio:9000}")
    private String internalEndpoint;
    
    @Value("${app.minio.public-endpoint:http://localhost:9000}")
    private String publicEndpoint;
    
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
            return putWithKey(objectKey, inputStream, mimeType);
        } catch (Exception e) {
            log.error("Erreur lors de l'upload du fichier: {}", e.getMessage());
            throw new RuntimeException("Impossible d'uploader le fichier", e);
        }
    }
    
    /**
     * Upload un fichier avec une clé S3 spécifique
     */
    public String putWithKey(String objectKey, InputStream inputStream, String mimeType) {
        try {
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
            String url = presignedRequest.url().toString();
            
            // Remplacer l'URL interne par l'URL publique pour que le navigateur puisse y accéder
            // MinIO peut générer des URLs avec différents hostnames (minio, docs.minio, etc.)
            if (internalEndpoint != null && publicEndpoint != null && !internalEndpoint.equals(publicEndpoint)) {
                try {
                    java.net.URL urlObj = new java.net.URL(url);
                    String currentHost = urlObj.getHost();
                    int currentPort = urlObj.getPort() != -1 ? urlObj.getPort() : urlObj.getDefaultPort();
                    
                    // Extraire le hostname et port de l'endpoint public
                    java.net.URL publicUrlObj = new java.net.URL(publicEndpoint);
                    String publicHost = publicUrlObj.getHost();
                    int publicPort = publicUrlObj.getPort() != -1 ? publicUrlObj.getPort() : publicUrlObj.getDefaultPort();
                    
                    // Si le hostname actuel est un hostname interne (minio, docs.minio, etc.), le remplacer
                    if (currentHost.contains("minio") || currentHost.contains("docs")) {
                        String newUrl = url.replace(currentHost + ":" + currentPort, publicHost + ":" + publicPort);
                        if (currentPort == -1) {
                            // Si pas de port explicite, remplacer juste le hostname
                            newUrl = url.replace(currentHost, publicHost);
                            // Ajouter le port si nécessaire
                            if (publicPort != -1 && publicPort != 80 && publicPort != 443) {
                                newUrl = newUrl.replace(publicHost, publicHost + ":" + publicPort);
                            }
                        }
                        url = newUrl;
                        log.debug("URL presignée convertie de {}:{} vers {}:{}", currentHost, currentPort, publicHost, publicPort);
                    }
                } catch (Exception e) {
                    log.warn("Erreur lors du remplacement de l'URL presignée: {}", e.getMessage());
                    // Fallback: remplacement simple
                    url = url.replace("http://minio:", "http://localhost:");
                    url = url.replace("http://docs.minio:", "http://localhost:");
                }
            }
            
            return url;
            
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
