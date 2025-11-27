package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateEnlevementRequest;
import ma.iorecycling.dto.CreatePickupItemRequest;
import ma.iorecycling.dto.EnlevementDTO;
import ma.iorecycling.entity.Enlevement;
import ma.iorecycling.entity.PickupItem;
import ma.iorecycling.entity.Site;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.mapper.EnlevementMapper;
import ma.iorecycling.repository.EnlevementRepository;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service pour la gestion des enlèvements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EnlevementService {
    
    private final EnlevementRepository enlevementRepository;
    private final PickupItemRepository pickupItemRepository;
    private final SocieteRepository societeRepository;
    private final SiteRepository siteRepository;
    private final EnlevementMapper enlevementMapper;
    
    /**
     * Crée un nouvel enlèvement avec ses items
     */
    public EnlevementDTO createEnlevement(CreateEnlevementRequest request, String createdBy) {
        log.info("Création d'un nouvel enlèvement pour la société ID {}", request.getSocieteId());
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        // Vérifier que le site existe et appartient à la société
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
        
        if (!site.getSociete().getId().equals(societe.getId())) {
            throw new IllegalArgumentException("Le site ne correspond pas à la société");
        }
        
        // Créer l'enlèvement
        Enlevement enlevement = Enlevement.builder()
                .dateEnlevement(request.getDateEnlevement())
                .site(site)
                .societe(societe)
                .observation(request.getObservation())
                .createdBy(createdBy)
                .build();
        
        Enlevement savedEnlevement = enlevementRepository.save(enlevement);

        if (savedEnlevement.getNumeroEnlevement() == null) {
            savedEnlevement.setNumeroEnlevement(generateNumeroEnlevement(savedEnlevement));
            savedEnlevement = enlevementRepository.save(savedEnlevement);
        }
        
        // Créer les items
        for (CreatePickupItemRequest itemRequest : request.getItems()) {
            PickupItem item = createPickupItem(savedEnlevement, itemRequest);
            pickupItemRepository.save(item);
        }
        
        // Recharger l'enlèvement avec ses items
        savedEnlevement = enlevementRepository.findById(savedEnlevement.getId())
                .orElseThrow();
        
        log.info("Enlèvement créé avec succès : {}", savedEnlevement.getNumeroEnlevement());
        return enlevementMapper.toDTO(savedEnlevement);
    }

    private String generateNumeroEnlevement(Enlevement enlevement) {
        int year = enlevement.getDateEnlevement() != null
                ? enlevement.getDateEnlevement().getYear()
                : LocalDate.now().getYear();
        return "ENL-" + year + "-" + String.format("%06d", enlevement.getId());
    }
    
    private PickupItem createPickupItem(Enlevement enlevement, CreatePickupItemRequest request) {
        PickupItem.TypeDechet typeDechet;
        try {
            typeDechet = PickupItem.TypeDechet.valueOf(request.getTypeDechet().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type de déchet invalide : " + request.getTypeDechet());
        }
        
        return PickupItem.builder()
                .enlevement(enlevement)
                .typeDechet(typeDechet)
                .sousType(request.getSousType())
                .quantiteKg(request.getQuantiteKg())
                .prixUnitaireMad(request.getPrixUnitaireMad())
                .build();
    }
    
    /**
     * Récupère un enlèvement par son ID
     */
    @Transactional(readOnly = true)
    public EnlevementDTO getEnlevementById(Long id) {
        Enlevement enlevement = enlevementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé avec l'ID : " + id));
        
        return enlevementMapper.toDTO(enlevement);
    }
    
    /**
     * Récupère tous les enlèvements (paginé)
     */
    @Transactional(readOnly = true)
    public Page<EnlevementDTO> getAllEnlevements(Pageable pageable) {
        return enlevementRepository.findAll(pageable)
                .map(enlevementMapper::toDTO);
    }
    
    /**
     * Récupère tous les enlèvements d'une société
     */
    @Transactional(readOnly = true)
    public Page<EnlevementDTO> getEnlevementsBySociete(Long societeId, Pageable pageable) {
        return enlevementRepository.findBySocieteId(societeId, pageable)
                .map(enlevementMapper::toDTO);
    }
    
    /**
     * Récupère les enlèvements d'une société entre deux dates
     */
    @Transactional(readOnly = true)
    public List<EnlevementDTO> getEnlevementsBySocieteAndDateRange(
            Long societeId, LocalDate dateDebut, LocalDate dateFin) {
        
        List<Enlevement> enlevements = enlevementRepository.findBySocieteIdAndDateBetween(
                societeId, dateDebut, dateFin);
        
        return enlevements.stream()
                .map(enlevementMapper::toDTO)
                .toList();
    }
    
    /**
     * Supprime un enlèvement
     */
    public void deleteEnlevement(Long id) {
        log.info("Suppression de l'enlèvement ID {}", id);
        
        if (!enlevementRepository.existsById(id)) {
            throw new IllegalArgumentException("Enlèvement non trouvé avec l'ID : " + id);
        }
        
        enlevementRepository.deleteById(id);
        log.info("Enlèvement supprimé avec succès : ID {}", id);
    }
}

