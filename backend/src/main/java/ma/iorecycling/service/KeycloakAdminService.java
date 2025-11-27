package ma.iorecycling.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.config.KeycloakAdminProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminService {

    private final RestTemplateBuilder restTemplateBuilder;
    private final KeycloakAdminProperties properties;

    private RestTemplate restTemplate;

    @PostConstruct
    void init() {
        this.restTemplate = restTemplateBuilder.build();
    }

    public String createUser(String username,
                             String email,
                             String firstName,
                             String lastName,
                             Long societeId,
                             String password,
                             boolean temporaryPassword) {
        try {
            String accessToken = obtainAdminToken();
            String userId = createUserEntity(accessToken, username, email, firstName, lastName, societeId);
            updatePassword(accessToken, userId, password, temporaryPassword);
            assignClientRole(accessToken, userId);
            return userId;
        } catch (HttpStatusCodeException e) {
            log.error("Erreur Keycloak {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("Impossible de créer l'utilisateur dans Keycloak : " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Erreur lors de la création Keycloak : {}", e.getMessage(), e);
            throw new IllegalStateException("Impossible de créer l'utilisateur dans Keycloak");
        }
    }

    public void deleteUser(String keycloakUserId) {
        if (keycloakUserId == null || keycloakUserId.isBlank()) {
            return;
        }
        try {
            String accessToken = obtainAdminToken();
            HttpHeaders headers = bearerHeaders(accessToken);
            restTemplate.exchange(
                realmUrl("/users/" + keycloakUserId),
                HttpMethod.DELETE,
                new HttpEntity<>(headers),
                Void.class
            );
        } catch (Exception e) {
            log.warn("Impossible de supprimer l'utilisateur Keycloak {}: {}", keycloakUserId, e.getMessage());
        }
    }

    public String generateTemporaryPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String createUserEntity(String token,
                                    String username,
                                    String email,
                                    String firstName,
                                    String lastName,
                                    Long societeId) {
        HttpHeaders headers = bearerHeaders(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = Map.of(
                "username", username,
                "email", email,
                "emailVerified", true,
                "firstName", firstName,
                "lastName", lastName,
                "enabled", true,
                "attributes", Map.of(
                        "clientId", List.of(String.valueOf(societeId))
                )
        );

        ResponseEntity<Void> response = restTemplate.exchange(
                realmUrl("/users"),
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                Void.class
        );

        URI location = response.getHeaders().getLocation();
        if (location == null) {
            throw new IllegalStateException("Keycloak n'a pas retourné d'identifiant utilisateur");
        }
        String path = location.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private void updatePassword(String token, String userId, String password, boolean temporary) {
        HttpHeaders headers = bearerHeaders(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "type", "password",
                "value", password,
                "temporary", temporary
        );

        restTemplate.exchange(
                realmUrl("/users/" + userId + "/reset-password"),
                HttpMethod.PUT,
                new HttpEntity<>(body, headers),
                Void.class
        );
    }

    private void assignClientRole(String token, String userId) {
        HttpHeaders headers = bearerHeaders(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map<String, Object>> roleResponse = restTemplate.exchange(
                realmUrl("/roles/" + properties.getClientRole()),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> roleBody = roleResponse.getBody();
        Object roleId = roleBody != null ? roleBody.get("id") : null;
        if (roleId == null) {
            throw new IllegalStateException("Rôle " + properties.getClientRole() + " introuvable dans Keycloak");
        }

        List<Map<String, Object>> roles = List.of(Map.of(
                "id", roleId,
                "name", properties.getClientRole()
        ));

        restTemplate.exchange(
                realmUrl("/users/" + userId + "/role-mappings/realm"),
                HttpMethod.POST,
                new HttpEntity<>(roles, headers),
                Void.class
        );
    }

    private String obtainAdminToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("username", properties.getUsername());
        body.add("password", properties.getPassword());
        body.add("grant_type", "password");
        body.add("client_id", properties.getClientId());

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                tokenUrl(),
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || responseBody.get("access_token") == null) {
            throw new IllegalStateException("Token admin Keycloak introuvable");
        }
        return responseBody.get("access_token").toString();
    }

    private String tokenUrl() {
        return properties.getServerUrl() + "/realms/master/protocol/openid-connect/token";
    }

    private String realmUrl(String path) {
        return properties.getServerUrl() + "/admin/realms/" + properties.getRealm() + path;
    }

    private HttpHeaders bearerHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}

