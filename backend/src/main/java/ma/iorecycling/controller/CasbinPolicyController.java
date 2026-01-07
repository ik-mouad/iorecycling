package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CasbinPolicyDTO;
import ma.iorecycling.service.CasbinPolicyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST pour gérer les politiques Casbin
 * Permet de modifier les permissions dynamiquement sans redémarrer l'application
 */
@RestController
@RequestMapping("/api/admin/casbin/policies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Casbin Policies", description = "API pour gérer les politiques d'autorisation Casbin")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter (nécessite permission swagger:write)
public class CasbinPolicyController {

    private final CasbinPolicyService casbinPolicyService;

    /**
     * Récupère toutes les politiques
     */
    @GetMapping
    @Operation(summary = "Liste toutes les politiques", description = "Récupère toutes les politiques Casbin")
    public ResponseEntity<List<List<String>>> getAllPolicies() {
        log.info("GET /api/admin/casbin/policies");
        List<List<String>> policies = casbinPolicyService.getAllPolicies();
        return ResponseEntity.ok(policies);
    }

    /**
     * Récupère les politiques pour un rôle donné
     */
    @GetMapping("/role/{role}")
    @Operation(summary = "Politiques d'un rôle", description = "Récupère toutes les politiques pour un rôle spécifique")
    public ResponseEntity<List<List<String>>> getPoliciesForRole(@PathVariable String role) {
        log.info("GET /api/admin/casbin/policies/role/{}", role);
        List<List<String>> policies = casbinPolicyService.getPoliciesForRole(role);
        return ResponseEntity.ok(policies);
    }

    /**
     * Ajoute une nouvelle politique
     */
    @PostMapping
    @Operation(summary = "Ajouter une politique", description = "Ajoute une nouvelle politique Casbin")
    public ResponseEntity<Map<String, Object>> addPolicy(@Valid @RequestBody CasbinPolicyDTO policy) {
        log.info("POST /api/admin/casbin/policies - {} -> {}:{}", policy.getRole(), policy.getResource(), policy.getAction());
        
        boolean added = casbinPolicyService.addPolicy(policy.getRole(), policy.getResource(), policy.getAction());
        
        if (added) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Politique ajoutée avec succès"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "La politique existe déjà ou une erreur s'est produite"));
        }
    }

    /**
     * Supprime une politique
     */
    @DeleteMapping
    @Operation(summary = "Supprimer une politique", description = "Supprime une politique Casbin existante")
    public ResponseEntity<Map<String, Object>> removePolicy(@Valid @RequestBody CasbinPolicyDTO policy) {
        log.info("DELETE /api/admin/casbin/policies - {} -> {}:{}", policy.getRole(), policy.getResource(), policy.getAction());
        
        boolean removed = casbinPolicyService.removePolicy(policy.getRole(), policy.getResource(), policy.getAction());
        
        if (removed) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Politique supprimée avec succès"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "La politique n'existe pas"));
        }
    }

    /**
     * Vérifie si une politique existe
     */
    @PostMapping("/check")
    @Operation(summary = "Vérifier une politique", description = "Vérifie si une politique existe")
    public ResponseEntity<Map<String, Object>> checkPolicy(@Valid @RequestBody CasbinPolicyDTO policy) {
        log.info("POST /api/admin/casbin/policies/check - {} -> {}:{}", policy.getRole(), policy.getResource(), policy.getAction());
        
        boolean exists = casbinPolicyService.hasPolicy(policy.getRole(), policy.getResource(), policy.getAction());
        
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * Recharge les politiques depuis la base de données
     */
    @PostMapping("/reload")
    @Operation(summary = "Recharger les politiques", description = "Recharge les politiques depuis la base de données")
    public ResponseEntity<Map<String, Object>> reloadPolicies() {
        log.info("POST /api/admin/casbin/policies/reload");
        
        casbinPolicyService.reloadPolicy();
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Politiques rechargées depuis la base de données"));
    }
}

