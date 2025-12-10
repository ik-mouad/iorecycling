package ma.iorecycling.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.service.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initialiseur MinIO au démarrage de l'application
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MinIOInitializer implements CommandLineRunner {
    
    private final StorageService storageService;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Initialisation de MinIO...");
        
        try {
            storageService.initializeBucket();
            log.info("✅ MinIO initialisé avec succès");
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'initialisation de MinIO: {}", e.getMessage());
            // Ne pas faire échouer le démarrage de l'application
        }
    }
}
