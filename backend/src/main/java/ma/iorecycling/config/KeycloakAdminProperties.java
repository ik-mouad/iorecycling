package ma.iorecycling.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "keycloak.admin")
public class KeycloakAdminProperties {

    /**
     * Base URL de Keycloak, ex: http://keycloak:8080/auth
     */
    private String serverUrl = "http://keycloak:8080/auth";

    /**
     * Realm cible (ex: iorecycling)
     */
    private String realm = "iorecycling";

    /**
     * Client utilisé pour obtenir le token admin (par défaut admin-cli)
     */
    private String clientId = "admin-cli";

    private String username = "admin";
    private String password = "admin";

    /**
     * Rôle Realm à assigner aux utilisateurs clients
     */
    private String clientRole = "CLIENT";
}

