package ma.iorecycling.config;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.service.ClientContextService;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtre pour enrichir le MDC (Mapped Diagnostic Context) avec des informations contextuelles
 * pour la corrélation des logs : tenantId, userId, traceId, spanId, http.route, etc.
 * 
 * Note: L'ordre est défini pour s'exécuter après OpenTelemetry (qui utilise HIGHEST_PRECEDENCE)
 * mais avant les autres filtres pour garantir que le MDC est enrichi avant les logs.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10) // Après OpenTelemetry mais avant les autres filtres
@Slf4j
@RequiredArgsConstructor
public class LoggingContextFilter extends OncePerRequestFilter {

    private final ClientContextService clientContextService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        
        // Wrapper pour pouvoir lire le body plusieurs fois si nécessaire
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        
        try {
            // Extraire tenantId depuis le contexte de sécurité
            Long tenantId = clientContextService.getCurrentClientId();
            if (tenantId != null) {
                MDC.put("tenantId", tenantId.toString());
            }
            
            // Extraire userId depuis le JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                String userId = jwt.getSubject(); // sub claim
                if (userId != null) {
                    MDC.put("userId", userId);
                }
            }
            
            // Extraire traceId et spanId depuis OpenTelemetry Span Context
            Span currentSpan = Span.current();
            SpanContext spanContext = currentSpan.getSpanContext();
            if (spanContext.isValid()) {
                // Format W3C Trace Context : traceId (32 chars hex) et spanId (16 chars hex)
                String traceId = spanContext.getTraceId();
                String spanId = spanContext.getSpanId();
                if (traceId != null && !traceId.isEmpty()) {
                    MDC.put("traceId", traceId);
                }
                if (spanId != null && !spanId.isEmpty()) {
                    MDC.put("spanId", spanId);
                }
            }
            
            // Fallback : extraire depuis le header traceparent si OpenTelemetry n'a pas créé de span
            if (MDC.get("traceId") == null) {
                String traceparent = request.getHeader("traceparent");
                if (traceparent != null && !traceparent.isEmpty()) {
                    // Format traceparent: version-traceId-parentId-flags
                    String[] parts = traceparent.split("-");
                    if (parts.length >= 2) {
                        String traceId = parts[1];
                        if (traceId.length() == 32) {
                            MDC.put("traceId", traceId);
                        }
                    }
                    if (parts.length >= 3) {
                        String spanId = parts[2];
                        if (spanId.length() == 16) {
                            MDC.put("spanId", spanId);
                        }
                    }
                }
            }
            
            // Extraire informations HTTP
            String httpMethod = request.getMethod();
            String httpRoute = getHttpRoute(request);
            MDC.put("http_method", httpMethod);
            MDC.put("http_route", httpRoute);
            
            // Ajouter requestId pour corrélation
            MDC.put("requestId", requestId);
            wrappedResponse.setHeader("X-Request-Id", requestId);
            
            // Exécuter la chaîne de filtres
            filterChain.doFilter(wrappedRequest, wrappedResponse);
            
        } catch (Exception e) {
            // En cas d'exception, logger le type et le message
            MDC.put("exception_type", e.getClass().getSimpleName());
            MDC.put("exception_message", e.getMessage() != null ? e.getMessage() : "");
            // Si une exception est levée, Spring Boot va créer une réponse d'erreur (500 par défaut)
            // On ne relance pas l'exception ici pour permettre à Spring de gérer la réponse
            throw e;
        } finally {
            // Toujours ajouter le http_status_code dans le finally pour qu'il soit présent même en cas d'exception
            // Spring Boot aura déjà défini le code de statut dans la réponse (500 pour les exceptions non gérées)
            int statusCode = wrappedResponse.getStatus();
            if (statusCode == 0) {
                // Si le statut est 0, c'est qu'une exception s'est produite avant que Spring ne définisse le code
                // On utilise 500 par défaut pour les erreurs serveur
                statusCode = 500;
            }
            MDC.put("http_status_code", String.valueOf(statusCode));
            
            // Calculer la durée après traitement
            long durationMs = System.currentTimeMillis() - startTime;
            MDC.put("durationMs", String.valueOf(durationMs));
            
            // Copier le contenu de la réponse
            wrappedResponse.copyBodyToResponse();
            
            // Nettoyer le MDC après la requête pour éviter les memory leaks
            MDC.clear();
        }
    }
    
    /**
     * Extrait la route HTTP depuis la requête (ex: /api/client/demandes)
     * Évite d'inclure les IDs dans la route pour réduire la cardinalité
     */
    private String getHttpRoute(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty()) {
            path = path.substring(contextPath.length());
        }
        
        // Simplifier les routes avec IDs (ex: /api/client/demandes/123 -> /api/client/demandes/{id})
        // Pattern simple : remplacer les segments numériques par {id}
        String[] parts = path.split("/");
        StringBuilder route = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) route.append("/");
            String part = parts[i];
            if (part.matches("\\d+")) {
                route.append("{id}");
            } else {
                route.append(part);
            }
        }
        
        return route.toString();
    }
}

