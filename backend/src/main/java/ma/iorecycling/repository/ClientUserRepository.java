package ma.iorecycling.repository;

import ma.iorecycling.entity.ClientUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité ClientUser
 */
@Repository
public interface ClientUserRepository extends JpaRepository<ClientUser, Long> {
    
    /**
     * Trouve un utilisateur par son email
     */
    Optional<ClientUser> findByEmail(String email);
    
    /**
     * Trouve un utilisateur par son ID Keycloak
     */
    Optional<ClientUser> findByKeycloakUserId(String keycloakUserId);
    
    /**
     * Vérifie si un email existe déjà
     */
    boolean existsByEmail(String email);
    
    /**
     * Trouve tous les utilisateurs d'une société
     */
    List<ClientUser> findBySocieteId(Long societeId);
    
    /**
     * Trouve tous les utilisateurs actifs d'une société
     */
    List<ClientUser> findBySocieteIdAndActiveTrue(Long societeId);
}

