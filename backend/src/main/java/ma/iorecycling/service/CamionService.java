package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CamionDTO;
import ma.iorecycling.dto.CreateCamionRequest;
import ma.iorecycling.dto.UpdateCamionRequest;
import ma.iorecycling.entity.Camion;
import ma.iorecycling.entity.TypeCamion;
import ma.iorecycling.mapper.CamionMapper;
import ma.iorecycling.repository.CamionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des camions
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CamionService {
    
    private final CamionRepository camionRepository;
    private final CamionMapper camionMapper;
    
    /**
     * Crée un nouveau camion
     */
    public CamionDTO createCamion(CreateCamionRequest request) {
        log.info("Création d'un nouveau camion : {}", request.getMatricule());
        
        // Vérifier l'unicité du matricule
        if (camionRepository.existsByMatricule(request.getMatricule())) {
            throw new IllegalArgumentException("Un camion avec ce matricule existe déjà");
        }
        
        Camion camion = camionMapper.toEntity(request);
        Camion savedCamion = camionRepository.save(camion);
        
        log.info("Camion créé avec succès : ID {}", savedCamion.getId());
        return camionMapper.toDTO(savedCamion);
    }
    
    /**
     * Récupère tous les camions avec pagination
     */
    @Transactional(readOnly = true)
    public Page<CamionDTO> getAllCamions(Pageable pageable) {
        return camionRepository.findAll(pageable)
                .map(camionMapper::toDTO);
    }
    
    /**
     * Récupère tous les camions actifs
     */
    @Transactional(readOnly = true)
    public List<CamionDTO> getActiveCamions() {
        return camionRepository.findByActifTrue()
                .stream()
                .map(camionMapper::toDTO)
                .toList();
    }
    
    /**
     * Récupère un camion par son ID
     */
    @Transactional(readOnly = true)
    public CamionDTO getCamionById(Long id) {
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Camion non trouvé avec l'ID : " + id));
        
        return camionMapper.toDTO(camion);
    }
    
    /**
     * Met à jour un camion
     */
    public CamionDTO updateCamion(Long id, UpdateCamionRequest request) {
        log.info("Mise à jour du camion ID {}", id);
        
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Camion non trouvé avec l'ID : " + id));
        
        camionMapper.updateEntity(camion, request);
        Camion updatedCamion = camionRepository.save(camion);
        
        log.info("Camion mis à jour avec succès : ID {}", id);
        return camionMapper.toDTO(updatedCamion);
    }
    
    /**
     * Supprime un camion
     */
    public void deleteCamion(Long id) {
        log.info("Suppression du camion ID {}", id);
        
        if (!camionRepository.existsById(id)) {
            throw new IllegalArgumentException("Camion non trouvé avec l'ID : " + id);
        }
        
        camionRepository.deleteById(id);
        log.info("Camion supprimé avec succès : ID {}", id);
    }
    
    /**
     * Filtre les camions avec critères multiples
     */
    @Transactional(readOnly = true)
    public Page<CamionDTO> findWithFilters(Boolean actif, Long societeProprietaireId, TypeCamion typeCamion, Pageable pageable) {
        return camionRepository.findWithFilters(actif, societeProprietaireId, typeCamion, pageable)
                .map(camionMapper::toDTO);
    }
    
    /**
     * Récupère les camions actifs par société propriétaire
     */
    @Transactional(readOnly = true)
    public List<CamionDTO> getActiveCamionsBySocieteProprietaire(Long societeProprietaireId) {
        return camionRepository.findBySocieteProprietaireIdAndActifTrue(societeProprietaireId)
                .stream()
                .map(camionMapper::toDTO)
                .toList();
    }
    
    /**
     * Vérifie si un camion est actif (pour validation lors de l'affectation à un enlèvement)
     */
    @Transactional(readOnly = true)
    public boolean isCamionActif(Long camionId) {
        return camionRepository.findById(camionId)
                .map(Camion::getActif)
                .orElse(false);
    }
}

