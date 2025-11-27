package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateSiteRequest;
import ma.iorecycling.dto.SiteDTO;
import ma.iorecycling.entity.Site;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des sites
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SiteService {
    
    private final SiteRepository siteRepository;
    private final SocieteRepository societeRepository;
    
    /**
     * Crée un nouveau site pour une société
     */
    public SiteDTO createSite(CreateSiteRequest request) {
        log.info("Création d'un nouveau site '{}' pour société {}", request.getName(), request.getSocieteId());
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        Site site = Site.builder()
                .societe(societe)
                .name(request.getName())
                .adresse(request.getAdresse())
                .build();
        
        Site savedSite = siteRepository.save(site);
        
        log.info("Site créé avec succès : ID {}", savedSite.getId());
        return toDTO(savedSite);
    }
    
    /**
     * Récupère tous les sites d'une société
     */
    @Transactional(readOnly = true)
    public List<SiteDTO> getSitesBySociete(Long societeId) {
        return siteRepository.findBySocieteId(societeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère un site par son ID
     */
    @Transactional(readOnly = true)
    public SiteDTO getSiteById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé avec l'ID : " + id));
        
        return toDTO(site);
    }
    
    /**
     * Met à jour un site
     */
    public SiteDTO updateSite(Long id, CreateSiteRequest request) {
        log.info("Mise à jour du site ID {}", id);
        
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé avec l'ID : " + id));
        
        site.setName(request.getName());
        site.setAdresse(request.getAdresse());
        
        Site updatedSite = siteRepository.save(site);
        
        log.info("Site mis à jour avec succès : ID {}", id);
        return toDTO(updatedSite);
    }
    
    /**
     * Supprime un site
     */
    public void deleteSite(Long id) {
        log.info("Suppression du site ID {}", id);
        
        if (!siteRepository.existsById(id)) {
            throw new IllegalArgumentException("Site non trouvé avec l'ID : " + id);
        }
        
        siteRepository.deleteById(id);
        log.info("Site supprimé avec succès : ID {}", id);
    }
    
    private SiteDTO toDTO(Site site) {
        return SiteDTO.builder()
                .id(site.getId())
                .societeId(site.getSociete().getId())
                .societeNom(site.getSociete().getRaisonSociale())
                .name(site.getName())
                .adresse(site.getAdresse())
                .createdAt(site.getCreatedAt())
                .nbEnlevements(site.getEnlevements() != null ? site.getEnlevements().size() : 0)
                .build();
    }
}

