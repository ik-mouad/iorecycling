package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSocieteProprietaireRequest;
import ma.iorecycling.dto.SocieteProprietaireDTO;
import ma.iorecycling.dto.UpdateSocieteProprietaireRequest;
import ma.iorecycling.entity.SocieteProprietaire;
import ma.iorecycling.mapper.SocieteProprietaireMapper;
import ma.iorecycling.repository.SocieteProprietaireRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des sociétés propriétaires de camions
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SocieteProprietaireService {
    
    private final SocieteProprietaireRepository societeProprietaireRepository;
    private final SocieteProprietaireMapper societeProprietaireMapper;
    
    /**
     * Crée une nouvelle société propriétaire
     */
    public SocieteProprietaireDTO createSocieteProprietaire(CreateSocieteProprietaireRequest request) {
        log.info("Création d'une nouvelle société propriétaire : {}", request.getRaisonSociale());
        
        SocieteProprietaire societe = societeProprietaireMapper.toEntity(request);
        SocieteProprietaire savedSociete = societeProprietaireRepository.save(societe);
        
        log.info("Société propriétaire créée avec succès : ID {}", savedSociete.getId());
        return societeProprietaireMapper.toDTO(savedSociete);
    }
    
    /**
     * Récupère toutes les sociétés propriétaires avec pagination
     */
    @Transactional(readOnly = true)
    public Page<SocieteProprietaireDTO> getAllSocietesProprietaires(Pageable pageable) {
        return societeProprietaireRepository.findAll(pageable)
                .map(societeProprietaireMapper::toDTO);
    }
    
    /**
     * Récupère toutes les sociétés propriétaires actives
     */
    @Transactional(readOnly = true)
    public List<SocieteProprietaireDTO> getActiveSocietesProprietaires() {
        return societeProprietaireRepository.findByActifTrue()
                .stream()
                .map(societeProprietaireMapper::toDTO)
                .toList();
    }
    
    /**
     * Récupère une société propriétaire par son ID
     */
    @Transactional(readOnly = true)
    public SocieteProprietaireDTO getSocieteProprietaireById(Long id) {
        SocieteProprietaire societe = societeProprietaireRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Société propriétaire non trouvée avec l'ID : " + id));
        
        return societeProprietaireMapper.toDTO(societe);
    }
    
    /**
     * Met à jour une société propriétaire
     */
    public SocieteProprietaireDTO updateSocieteProprietaire(Long id, UpdateSocieteProprietaireRequest request) {
        log.info("Mise à jour de la société propriétaire ID {}", id);
        
        SocieteProprietaire societe = societeProprietaireRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Société propriétaire non trouvée avec l'ID : " + id));
        
        societeProprietaireMapper.updateEntity(societe, request);
        SocieteProprietaire updatedSociete = societeProprietaireRepository.save(societe);
        
        log.info("Société propriétaire mise à jour avec succès : ID {}", id);
        return societeProprietaireMapper.toDTO(updatedSociete);
    }
    
    /**
     * Supprime une société propriétaire
     */
    public void deleteSocieteProprietaire(Long id) {
        log.info("Suppression de la société propriétaire ID {}", id);
        
        if (!societeProprietaireRepository.existsById(id)) {
            throw new IllegalArgumentException("Société propriétaire non trouvée avec l'ID : " + id);
        }
        
        societeProprietaireRepository.deleteById(id);
        log.info("Société propriétaire supprimée avec succès : ID {}", id);
    }
    
    /**
     * Recherche de sociétés propriétaires
     */
    @Transactional(readOnly = true)
    public Page<SocieteProprietaireDTO> search(String search, Pageable pageable) {
        return societeProprietaireRepository.search(search, pageable)
                .map(societeProprietaireMapper::toDTO);
    }
}

