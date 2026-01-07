package ma.iorecycling.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.service.CasbinService;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Filtre Casbin pour vérifier les autorisations basées sur les politiques
 * Ce filtre peut être utilisé en complément ou en remplacement des règles Spring Security
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CasbinAuthorizationFilter extends OncePerRequestFilter {

    private final CasbinService casbinService;

    // Mapping des chemins API aux ressources Casbin
    private static final Map<String, String> PATH_TO_RESOURCE = new HashMap<>();
    private static final Map<String, String> METHOD_TO_ACTION = new HashMap<>();

    static {
        // Mapping des chemins vers les ressources
        // Endpoints admin
        PATH_TO_RESOURCE.put("/api/admin/societes", "societes");
        PATH_TO_RESOURCE.put("/api/admin/enlevements", "enlevements");
        PATH_TO_RESOURCE.put("/api/admin/demandes", "demandes");
        PATH_TO_RESOURCE.put("/api/admin/planning", "planning");
        PATH_TO_RESOURCE.put("/api/admin/recurrences", "recurrences");
        PATH_TO_RESOURCE.put("/api/admin/camions", "camions");
        PATH_TO_RESOURCE.put("/api/admin/destinations", "destinations");
        PATH_TO_RESOURCE.put("/api/admin/ventes", "ventes");
        PATH_TO_RESOURCE.put("/api/admin/ventes/stocks", "stocks");
        PATH_TO_RESOURCE.put("/api/admin/sites", "societes"); // Sites font partie des sociétés
        PATH_TO_RESOURCE.put("/api/admin/documents", "enlevements"); // Documents liés aux enlèvements
        PATH_TO_RESOURCE.put("/api/admin/client-users", "societes"); // Gestion des utilisateurs clients
        
        // Endpoints client
        PATH_TO_RESOURCE.put("/api/client/enlevements", "enlevements");
        PATH_TO_RESOURCE.put("/api/client/demandes", "demandes");
        PATH_TO_RESOURCE.put("/api/client/dashboard", "demandes"); // Dashboard client
        PATH_TO_RESOURCE.put("/api/client/sites", "demandes"); // Sites du client
        
        // Endpoints comptabilité
        PATH_TO_RESOURCE.put("/api/comptabilite", "comptabilite");
        
        // Swagger/API docs
        PATH_TO_RESOURCE.put("/api/swagger-ui", "swagger");
        PATH_TO_RESOURCE.put("/v3/api-docs", "swagger");

        // Mapping des méthodes HTTP vers les actions
        METHOD_TO_ACTION.put("GET", "read");
        METHOD_TO_ACTION.put("POST", "write");
        METHOD_TO_ACTION.put("PUT", "write");
        METHOD_TO_ACTION.put("PATCH", "write");
        METHOD_TO_ACTION.put("DELETE", "write");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Vérifier si le chemin correspond à une ressource gérée par Casbin
        String resource = findResource(path);
        
        if (resource != null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated()) {
                String action = METHOD_TO_ACTION.getOrDefault(method, "read");
                
                // Vérifier la permission avec Casbin
                boolean hasPermission = casbinService.can(resource, action);
                
                if (!hasPermission) {
                    log.warn("Accès refusé par Casbin: {} {} - Utilisateur: {}", method, path, authentication.getName());
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"error\":\"Access denied\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Trouve la ressource Casbin correspondant au chemin de la requête
     */
    private String findResource(String path) {
        // Vérifier les correspondances exactes d'abord
        for (Map.Entry<String, String> entry : PATH_TO_RESOURCE.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }
}

