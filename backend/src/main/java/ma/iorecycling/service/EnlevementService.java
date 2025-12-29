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
import ma.iorecycling.repository.CamionRepository;
import ma.iorecycling.repository.DestinationRepository;
import ma.iorecycling.repository.EnlevementRepository;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import ma.iorecycling.repository.TransactionRepository;
import ma.iorecycling.service.TransactionService;
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
    private final CamionRepository camionRepository;
    private final DestinationRepository destinationRepository;
    private final EnlevementMapper enlevementMapper;
    private final TransactionGenerationService transactionGenerationService;
    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    
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
        
        // Vérifier le camion si fourni
        ma.iorecycling.entity.Camion camion = null;
        if (request.getCamionId() != null) {
            camion = camionRepository.findById(request.getCamionId())
                    .orElseThrow(() -> new IllegalArgumentException("Camion non trouvé avec l'ID : " + request.getCamionId()));
            
            // Vérifier que le camion est actif
            if (!camion.getActif()) {
                throw new IllegalArgumentException("Le camion sélectionné n'est pas actif et ne peut pas être utilisé pour un enlèvement");
            }
        }
        
        // Vérifier si des items A_DETRUIRE sont présents
        boolean hasDechetsDangereux = request.getItems().stream()
                .anyMatch(item -> "A_DETRUIRE".equals(item.getTypeDechet()));
        
        // Vérifier la destination
        ma.iorecycling.entity.Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new IllegalArgumentException("Destination non trouvée avec l'ID : " + request.getDestinationId()));
        }
        
        // Règle métier : Si des déchets dangereux sont présents, la destination est obligatoire et doit être compatible
        if (hasDechetsDangereux) {
            if (destination == null) {
                throw new IllegalArgumentException("Une destination est obligatoire lorsque l'enlèvement contient des déchets dangereux (A_DETRUIRE)");
            }
            
            if (!destination.peutTraiterDechetsDangereux()) {
                throw new IllegalArgumentException("La destination sélectionnée ne peut pas traiter les déchets dangereux. " +
                        "Elle doit avoir au moins un des types de traitement suivants : INCINERATION, ENFOUISSEMENT, DENATURATION_DESTRUCTION, TRAITEMENT");
            }
        }
        
        // Créer l'enlèvement
        Enlevement enlevement = Enlevement.builder()
                .dateEnlevement(request.getDateEnlevement())
                .heureEnlevement(request.getHeureEnlevement())
                .dateDestination(request.getDateDestination())
                .heureDestination(request.getHeureDestination())
                .site(site)
                .societe(societe)
                .observation(request.getObservation())
                .camion(camion)
                .chauffeurNom(request.getChauffeurNom())
                .destination(destination)
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
        
        // Générer automatiquement les transactions comptables
        try {
            transactionGenerationService.generateTransactionsFromEnlevement(savedEnlevement);
        } catch (Exception e) {
            log.warn("Erreur lors de la génération des transactions pour l'enlèvement {}: {}", 
                    savedEnlevement.getNumeroEnlevement(), e.getMessage());
            // On continue même si la génération échoue (l'enlèvement est créé)
        }
        
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
            String typeDechetStr = request.getTypeDechet().toUpperCase();
            typeDechet = PickupItem.TypeDechet.valueOf(typeDechetStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type de déchet invalide : " + request.getTypeDechet());
        }
        
        return PickupItem.builder()
                .enlevement(enlevement)
                .typeDechet(typeDechet)
                .sousType(request.getSousType())
                .quantiteKg(request.getQuantiteKg())
                .uniteMesure(request.getUniteMesure() != null && !request.getUniteMesure().trim().isEmpty() 
                        ? request.getUniteMesure() 
                        : "kg")
                .etat(request.getEtat())
                .prixUnitaireMad(request.getPrixUnitaireMad())
                .prixPrestationMad(request.getPrixPrestationMad())
                .prixAchatMad(request.getPrixAchatMad())
                .prixTraitementMad(request.getPrixTraitementMad())
                .build();
    }
    
    /**
     * Récupère un enlèvement par son ID avec ses transactions
     */
    @Transactional(readOnly = true)
    public EnlevementDTO getEnlevementById(Long id) {
        Enlevement enlevement = enlevementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé avec l'ID : " + id));
        
        EnlevementDTO dto = enlevementMapper.toDTO(enlevement);
        
        // Charger les transactions liées à cet enlèvement
        List<ma.iorecycling.entity.Transaction> transactions = transactionRepository.findByEnlevementId(id);
        dto.setTransactions(transactions.stream()
                .map(transactionService::toDTO)
                .collect(java.util.stream.Collectors.toList()));
        
        return dto;
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
    
    /**
     * Régénère les transactions comptables pour un enlèvement existant
     */
    public void regenerateTransactions(Long enlevementId) {
        log.info("Régénération des transactions pour l'enlèvement ID {}", enlevementId);
        
        Enlevement enlevement = enlevementRepository.findByIdWithItems(enlevementId)
                .orElseThrow(() -> new IllegalArgumentException("Enlèvement non trouvé avec l'ID : " + enlevementId));
        
        // Vérifier que l'enlèvement a des items
        if (enlevement.getItems() == null || enlevement.getItems().isEmpty()) {
            log.warn("L'enlèvement {} n'a pas d'items, aucune transaction à générer", enlevement.getNumeroEnlevement());
            return;
        }
        
        // Générer les transactions
        transactionGenerationService.generateTransactionsFromEnlevement(enlevement);
        
        log.info("Transactions régénérées avec succès pour l'enlèvement {}", enlevement.getNumeroEnlevement());
    }
}

