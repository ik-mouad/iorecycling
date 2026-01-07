package ma.iorecycling.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.ClientUserDTO;
import ma.iorecycling.dto.CreateClientUserRequest;
import ma.iorecycling.service.ClientUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des utilisateurs clients
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Utilisateurs", description = "API pour la gestion des utilisateurs clients")
// Autorisations gérées par Casbin via CasbinAuthorizationFilter
public class AdminClientUserController {
    
    private final ClientUserService clientUserService;
    
    /**
     * Crée un nouvel utilisateur
     */
    @PostMapping
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouvel utilisateur pour une société")
    public ResponseEntity<ClientUserDTO> createUser(@Valid @RequestBody CreateClientUserRequest request) {
        log.info("POST /api/admin/users - Création utilisateur {}", request.getEmail());
        
        try {
            ClientUserDTO user = clientUserService.createClientUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création utilisateur : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère un utilisateur par son ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un utilisateur", description = "Récupère les détails d'un utilisateur par son ID")
    public ResponseEntity<ClientUserDTO> getUserById(@PathVariable Long id) {
        log.info("GET /api/admin/users/{}", id);
        
        try {
            ClientUserDTO user = clientUserService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            log.error("Utilisateur non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Met à jour un utilisateur
     */
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un utilisateur", description = "Met à jour les informations d'un utilisateur")
    public ResponseEntity<ClientUserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody CreateClientUserRequest request) {
        
        log.info("PUT /api/admin/users/{}", id);
        
        try {
            ClientUserDTO user = clientUserService.updateClientUser(id, request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            log.error("Erreur mise à jour utilisateur : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Active ou désactive un utilisateur
     */
    @PutMapping("/{id}/toggle-active")
    @Operation(summary = "Activer/Désactiver un utilisateur", description = "Active ou désactive un utilisateur")
    public ResponseEntity<ClientUserDTO> toggleActive(@PathVariable Long id) {
        log.info("PUT /api/admin/users/{}/toggle-active", id);
        
        try {
            ClientUserDTO user = clientUserService.toggleActive(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            log.error("Utilisateur non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Supprime un utilisateur
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime un utilisateur et son compte Keycloak")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /api/admin/users/{}", id);
        
        try {
            clientUserService.deleteClientUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Utilisateur non trouvé : {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

/**
 * Controller pour les endpoints spécifiques aux sociétés
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sociétés - Utilisateurs", description = "API pour les utilisateurs d'une société")
    // Autorisations gérées par Casbin via CasbinAuthorizationFilter
class SocietesUsersController {
    
    private final ClientUserService clientUserService;
    
    /**
     * Récupère tous les utilisateurs d'une société
     */
    @GetMapping("/api/admin/societes/{societeId}/users")
    @Operation(summary = "Utilisateurs d'une société", description = "Récupère tous les utilisateurs d'une société")
    public ResponseEntity<List<ClientUserDTO>> getUsersBySociete(@PathVariable Long societeId) {
        log.info("GET /api/admin/societes/{}/users", societeId);
        
        List<ClientUserDTO> users = clientUserService.getUsersBySociete(societeId);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Crée un utilisateur pour une société (alternative endpoint)
     */
    @PostMapping("/api/admin/societes/{societeId}/users")
    @Operation(summary = "Ajouter un utilisateur à une société", description = "Crée un nouvel utilisateur pour une société")
    public ResponseEntity<ClientUserDTO> createUserForSociete(
            @PathVariable Long societeId,
            @Valid @RequestBody CreateClientUserRequest request) {
        
        log.info("POST /api/admin/societes/{}/users", societeId);
        
        // Forcer le societeId depuis l'URL
        request.setSocieteId(societeId);
        
        try {
            ClientUserDTO user = clientUserService.createClientUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            log.error("Erreur création utilisateur : {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}

