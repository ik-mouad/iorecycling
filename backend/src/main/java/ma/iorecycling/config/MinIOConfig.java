package ma.iorecycling.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configuration MinIO/S3
 */
@Configuration
@Slf4j
public class MinIOConfig {
    
    @Value("${app.minio.endpoint:http://minio:9000}")
    private String endpoint;
    
    @Value("${app.minio.access-key:minio}")
    private String accessKey;
    
    @Value("${app.minio.secret-key:minio123}")
    private String secretKey;
    
    @Value("${app.minio.region:us-east-1}")
    private String region;
    
    @Bean
    public S3Client s3Client() {
        log.info("Configuration MinIO - Endpoint: {}, Region: {}", endpoint, region);
        
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .forcePathStyle(true) // Important pour MinIO
                .build();
    }
    
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }
}
