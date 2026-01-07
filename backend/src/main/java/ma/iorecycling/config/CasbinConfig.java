package ma.iorecycling.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Casbin pour la gestion des autorisations
 * Utilise un adaptateur JDBC pour charger les politiques depuis la base de données
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class CasbinConfig {

    private final CasbinJdbcAdapter casbinJdbcAdapter;

    /**
     * Crée et configure l'enforcer Casbin avec le modèle RBAC et les politiques
     * Les politiques sont chargées depuis la base de données via l'adaptateur JDBC
     */
    @Bean
    public Enforcer casbinEnforcer() {
        try {
            // Charger le modèle depuis les ressources
            String modelPath = "casbin/model.conf";
            
            // Créer l'enforcer avec le modèle et l'adaptateur JDBC
            Enforcer enforcer = new Enforcer(modelPath, casbinJdbcAdapter);
            
            // Charger les politiques depuis la base de données
            enforcer.loadPolicy();
            
            log.info("Casbin enforcer initialisé avec {} politiques depuis la base de données", 
                    enforcer.getPolicy().size());
            
            return enforcer;
        } catch (Exception e) {
            log.error("Erreur lors de l'initialisation de Casbin", e);
            throw new RuntimeException("Erreur lors de l'initialisation de Casbin", e);
        }
    }
}

