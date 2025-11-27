package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSocieteRequest;
import ma.iorecycling.dto.SocieteDTO;
import ma.iorecycling.dto.UpdateSocieteRequest;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.mapper.SocieteMapper;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service pour la gestion des sociétés
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SocieteService {
    
    private final SocieteRepository societeRepository;
    private final SocieteMapper societeMapper;
    
    /**
     * Crée une nouvelle société
     */
    public SocieteDTO createSociete(CreateSocieteRequest request) {
        log.info("Création d'une nouvelle société : {}", request.getRaisonSociale());
        
        // Vérifier l'unicité de l'ICE
        if (societeRepository.existsByIce(request.getIce())) {
            throw new IllegalArgumentException("Une société avec cet ICE existe déjà");
        }
        
        Societe societe = societeMapper.toEntity(request);
        Societe savedSociete = societeRepository.save(societe);
        
        log.info("Société créée avec succès : ID {}", savedSociete.getId());
        return societeMapper.toDTO(savedSociete);
    }
    
    /**
     * Récupère toutes les sociétés
     */
    @Transactional(readOnly = true)
    public Page<SocieteDTO> getAllSocietes(Pageable pageable) {
        return societeRepository.findAll(pageable)
                .map(societeMapper::toDTO);
    }
    
    /**
     * Récupère une société par son ID
     */
    @Transactional(readOnly = true)
    public SocieteDTO getSocieteById(Long id) {
        Societe societe = societeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée avec l'ID : " + id));
        
        return societeMapper.toDTO(societe);
    }
    
    /**
     * Met à jour une société
     */
    public SocieteDTO updateSociete(Long id, UpdateSocieteRequest request) {
        log.info("Mise à jour de la société ID {}", id);
        
        Societe societe = societeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée avec l'ID : " + id));
        
        societeMapper.updateEntity(societe, request);
        Societe updatedSociete = societeRepository.save(societe);
        
        log.info("Société mise à jour avec succès : ID {}", id);
        return societeMapper.toDTO(updatedSociete);
    }
    
    /**
     * Supprime une société
     */
    public void deleteSociete(Long id) {
        log.info("Suppression de la société ID {}", id);
        
        if (!societeRepository.existsById(id)) {
            throw new IllegalArgumentException("Société non trouvée avec l'ID : " + id);
        }
        
        societeRepository.deleteById(id);
        log.info("Société supprimée avec succès : ID {}", id);
    }
    
    /**
     * Vérifie si une société existe
     */
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return societeRepository.existsById(id);
    }
}

