package ma.iorecycling.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties({CorsProperties.class, KeycloakAdminProperties.class})
public class SecurityConfig {

    private final CorsProperties corsProperties;

    public SecurityConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/client/**").hasRole("CLIENT")
                .requestMatchers("/api/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "COMPTABLE")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.getAllowedOrigins());
        configuration.setAllowedMethods(corsProperties.getAllowedMethods());
        // Autoriser tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        // Exposer les headers nécessaires pour le frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @Primary
    @ConditionalOnMissingBean(JwtDecoder.class)
    public JwtDecoder jwtDecoder() {
        // Utiliser explicitement l'URL interne pour récupérer les clés publiques
        // même si le token contient un issuer externe
        String jwkSetUri = "http://keycloak:8080/auth/realms/iorecycling/protocol/openid-connect/certs";
        
        System.out.println("=== Création du JwtDecoder personnalisé avec jwkSetUri: " + jwkSetUri + " ===");
        
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        
        // Créer un validator qui accepte plusieurs issuers possibles
        String internalIssuer = "http://keycloak:8080/auth/realms/iorecycling";
        String internalIssuer8081 = "http://keycloak:8081/auth/realms/iorecycling";
        String productionIssuer = "https://iorecycling.duckdns.org/auth/realms/iorecycling";
        String externalIssuer = "http://146.59.234.174:88/auth/realms/iorecycling";
        String localhostIssuer = "http://localhost:88/auth/realms/iorecycling";
        
        // Validator personnalisé qui accepte plusieurs issuers
        OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
            String tokenIssuer = jwt.getIssuer().toString();
            if (tokenIssuer.equals(internalIssuer) || 
                tokenIssuer.equals(internalIssuer8081) ||
                tokenIssuer.equals(productionIssuer) ||
                tokenIssuer.equals(externalIssuer) || 
                tokenIssuer.equals(localhostIssuer)) {
                return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.success();
            }
            return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
                new org.springframework.security.oauth2.core.OAuth2Error(
                    "invalid_token", 
                    "Token issuer not recognized: " + tokenIssuer, 
                    null
                )
            );
        };
        
        // Combiner avec le validator par défaut (expiration, etc.)
        OAuth2TokenValidator<Jwt> defaultValidator = JwtValidators.createDefault();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaultValidator, issuerValidator));
        
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object realmAccessClaim = jwt.getClaims().get("realm_access");
            if (!(realmAccessClaim instanceof Map)) {
                return List.of();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> realmAccess = (Map<String, Object>) realmAccessClaim;

            Object rolesClaim = realmAccess.get("roles");
            if (!(rolesClaim instanceof List)) {
                return List.of();
            }

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) rolesClaim;

            return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        });

        return converter;
    }
}
