package ma.iorecycling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration pour le logging enrichi avec contexte multi-tenant
 */
@Configuration
public class LoggingConfig {
    
    // Le LoggingContextFilter est déjà annoté @Component et sera automatiquement détecté
    // Cette classe sert de documentation et peut être étendue si nécessaire
}

