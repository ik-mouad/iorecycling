package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.ClientUserDTO;
import ma.iorecycling.dto.CreateClientUserRequest;
import ma.iorecycling.entity.ClientUser;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.ClientUserRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des utilisateurs clients
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClientUserService {
    
    private final ClientUserRepository clientUserRepository;
    private final SocieteRepository societeRepository;
    private final KeycloakAdminService keycloakAdminService;
    
    /**
     * Crée un nouvel utilisateur pour une société
     */
    public ClientUserDTO createClientUser(CreateClientUserRequest request) {
        log.info("Création d'un nouvel utilisateur '{}' pour société {}", request.getEmail(), request.getSocieteId());
        
        // Vérifier que l'email n'existe pas déjà
        if (clientUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        ClientUser user = ClientUser.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .posteOccupe(request.getPosteOccupe())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .societe(societe)
                .active(true)
                .build();
        
        ClientUser savedUser = clientUserRepository.save(user);

        String password = request.getPassword();
        if (password == null || password.isBlank()) {
            password = keycloakAdminService.generateTemporaryPassword();
        }
        boolean temporaryPassword = request.getTemporaryPassword() == null || request.getTemporaryPassword();

        String keycloakUserId = keycloakAdminService.createUser(
                request.getEmail(),
                request.getEmail(),
                request.getPrenom(),
                request.getNom(),
                request.getSocieteId(),
                password,
                temporaryPassword
        );

        savedUser.setKeycloakUserId(keycloakUserId);
        clientUserRepository.save(savedUser);
        
        log.info("Utilisateur créé avec succès : ID {}", savedUser.getId());
        return toDTO(savedUser);
    }
    
    /**
     * Récupère tous les utilisateurs d'une société
     */
    @Transactional(readOnly = true)
    public List<ClientUserDTO> getUsersBySociete(Long societeId) {
        return clientUserRepository.findBySocieteId(societeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère un utilisateur par son ID
     */
    @Transactional(readOnly = true)
    public ClientUserDTO getUserById(Long id) {
        ClientUser user = clientUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id));
        
        return toDTO(user);
    }
    
    /**
     * Met à jour un utilisateur
     */
    public ClientUserDTO updateClientUser(Long id, CreateClientUserRequest request) {
        log.info("Mise à jour de l'utilisateur ID {}", id);
        
        ClientUser user = clientUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id));
        
        // Vérifier email unique (si changé)
        if (!user.getEmail().equals(request.getEmail()) && 
            clientUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }
        
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setPosteOccupe(request.getPosteOccupe());
        user.setEmail(request.getEmail());
        user.setTelephone(request.getTelephone());
        
        ClientUser updatedUser = clientUserRepository.save(user);
        
        log.info("Utilisateur mis à jour avec succès : ID {}", id);
        return toDTO(updatedUser);
    }
    
    /**
     * Active ou désactive un utilisateur
     */
    public ClientUserDTO toggleActive(Long id) {
        log.info("Toggle active utilisateur ID {}", id);
        
        ClientUser user = clientUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id));
        
        user.setActive(!user.getActive());
        ClientUser updatedUser = clientUserRepository.save(user);
        
        log.info("Utilisateur {} : actif = {}", id, updatedUser.getActive());
        return toDTO(updatedUser);
    }
    
    /**
     * Supprime un utilisateur
     */
    public void deleteClientUser(Long id) {
        log.info("Suppression de l'utilisateur ID {}", id);
        
        ClientUser user = clientUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id));

        keycloakAdminService.deleteUser(user.getKeycloakUserId());
        clientUserRepository.delete(user);
        log.info("Utilisateur supprimé avec succès : ID {}", id);
    }
    
    private ClientUserDTO toDTO(ClientUser user) {
        return ClientUserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .posteOccupe(user.getPosteOccupe())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .societeId(user.getSociete().getId())
                .societeNom(user.getSociete().getRaisonSociale())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

