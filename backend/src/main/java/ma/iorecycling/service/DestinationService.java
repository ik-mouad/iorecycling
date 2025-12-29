package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateDestinationRequest;
import ma.iorecycling.dto.DestinationDTO;
import ma.iorecycling.dto.UpdateDestinationRequest;
import ma.iorecycling.entity.Destination;
import ma.iorecycling.mapper.DestinationMapper;
import ma.iorecycling.repository.DestinationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des destinations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DestinationService {
    
    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;
    
    /**
     * Crée une nouvelle destination
     */
    public DestinationDTO createDestination(CreateDestinationRequest request) {
        log.info("Création d'une nouvelle destination : {}", request.getRaisonSociale());
        
        // Vérifier qu'au moins un type de traitement est fourni
        if (request.getTypesTraitement() == null || request.getTypesTraitement().isEmpty()) {
            throw new IllegalArgumentException("Au moins un type de traitement est obligatoire");
        }
        
        Destination destination = destinationMapper.toEntity(request);
        Destination savedDestination = destinationRepository.save(destination);
        
        log.info("Destination créée avec succès : ID {}", savedDestination.getId());
        return destinationMapper.toDTO(savedDestination);
    }
    
    /**
     * Récupère toutes les destinations avec pagination
     */
    @Transactional(readOnly = true)
    public Page<DestinationDTO> getAllDestinations(Pageable pageable) {
        return destinationRepository.findAll(pageable)
                .map(destinationMapper::toDTO);
    }
    
    /**
     * Récupère toutes les destinations
     */
    @Transactional(readOnly = true)
    public List<DestinationDTO> getAllDestinations() {
        return destinationRepository.findAll()
                .stream()
                .map(destinationMapper::toDTO)
                .toList();
    }
    
    /**
     * Récupère une destination par son ID
     */
    @Transactional(readOnly = true)
    public DestinationDTO getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination non trouvée avec l'ID : " + id));
        
        return destinationMapper.toDTO(destination);
    }
    
    /**
     * Met à jour une destination
     */
    public DestinationDTO updateDestination(Long id, UpdateDestinationRequest request) {
        log.info("Mise à jour de la destination ID {}", id);
        
        // Vérifier qu'au moins un type de traitement est fourni
        if (request.getTypesTraitement() == null || request.getTypesTraitement().isEmpty()) {
            throw new IllegalArgumentException("Au moins un type de traitement est obligatoire");
        }
        
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination non trouvée avec l'ID : " + id));
        
        destinationMapper.updateEntity(destination, request);
        Destination updatedDestination = destinationRepository.save(destination);
        
        log.info("Destination mise à jour avec succès : ID {}", id);
        return destinationMapper.toDTO(updatedDestination);
    }
    
    /**
     * Supprime une destination
     */
    public void deleteDestination(Long id) {
        log.info("Suppression de la destination ID {}", id);
        
        if (!destinationRepository.existsById(id)) {
            throw new IllegalArgumentException("Destination non trouvée avec l'ID : " + id);
        }
        
        destinationRepository.deleteById(id);
        log.info("Destination supprimée avec succès : ID {}", id);
    }
    
    /**
     * Récupère les destinations pouvant traiter les déchets dangereux (A_DETRUIRE)
     */
    @Transactional(readOnly = true)
    public List<DestinationDTO> getDestinationsPourDechetsDangereux() {
        return destinationRepository.findDestinationsPourDechetsDangereux()
                .stream()
                .map(destinationMapper::toDTO)
                .toList();
    }
    
    /**
     * Vérifie si une destination peut traiter des déchets dangereux
     */
    @Transactional(readOnly = true)
    public boolean peutTraiterDechetsDangereux(Long destinationId) {
        return destinationRepository.findById(destinationId)
                .map(Destination::peutTraiterDechetsDangereux)
                .orElse(false);
    }
    
    /**
     * Recherche de destinations
     */
    @Transactional(readOnly = true)
    public Page<DestinationDTO> search(String search, Pageable pageable) {
        return destinationRepository.search(search, pageable)
                .map(destinationMapper::toDTO);
    }
}

