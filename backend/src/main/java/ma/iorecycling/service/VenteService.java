package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.*;
import ma.iorecycling.mapper.VenteMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des ventes de déchets
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenteService {
    
    private final VenteRepository venteRepository;
    private final VenteItemRepository venteItemRepository;
    private final PickupItemRepository pickupItemRepository;
    private final TransactionRepository transactionRepository;
    private final VenteMapper venteMapper;
    
    /**
     * Crée une nouvelle vente avec ses items
     */
    public VenteDTO createVente(CreateVenteRequest request, String createdBy) {
        log.info("Création d'une nouvelle vente");
        
        // Créer la vente
        Vente vente = Vente.builder()
                .dateVente(request.getDateVente())
                .acheteurId(request.getAcheteurId())
                .acheteurNom(request.getAcheteurNom())
                .observation(request.getObservation())
                .statut(Vente.StatutVente.BROUILLON)
                .createdBy(createdBy)
                .build();
        
        Vente savedVente = venteRepository.save(vente);
        
        // Générer le numéro de vente
        if (savedVente.getNumeroVente() == null) {
            savedVente.setNumeroVente(generateNumeroVente(savedVente));
            savedVente = venteRepository.save(savedVente);
        }
        
        // Créer les items
        for (CreateVenteItemRequest itemRequest : request.getItems()) {
            createVenteItem(savedVente, itemRequest);
        }
        
        log.info("Vente créée avec succès : {}", savedVente.getNumeroVente());
        return venteMapper.toDTO(savedVente);
    }
    
    /**
     * Valide une vente et génère les transactions comptables
     */
    public VenteDTO validerVente(Long venteId, String createdBy) {
        log.info("Validation de la vente ID {}", venteId);
        
        Vente vente = venteRepository.findById(venteId)
                .orElseThrow(() -> new IllegalArgumentException("Vente non trouvée"));
        
        if (vente.getStatut() != Vente.StatutVente.BROUILLON) {
            throw new IllegalStateException("Seules les ventes en brouillon peuvent être validées");
        }
        
        // Vérifier les stocks disponibles
        for (VenteItem item : vente.getItems()) {
            if (item.getPickupItem() != null) {
                PickupItem pickupItem = item.getPickupItem();
                BigDecimal resteDisponible = pickupItem.getResteAVendreKg();
                if (resteDisponible == null || resteDisponible.compareTo(item.getQuantiteVendueKg()) < 0) {
                    throw new IllegalStateException(
                        String.format("Stock insuffisant pour %s %s. Disponible: %s, Demandé: %s",
                            item.getTypeDechet(), item.getSousType(),
                            resteDisponible, item.getQuantiteVendueKg()));
                }
            }
        }
        
        // Mettre à jour les stocks
        for (VenteItem item : vente.getItems()) {
            if (item.getPickupItem() != null) {
                PickupItem pickupItem = item.getPickupItem();
                BigDecimal nouvelleQuantiteVendue = (pickupItem.getQuantiteVendueKg() != null 
                        ? pickupItem.getQuantiteVendueKg() : BigDecimal.ZERO)
                        .add(item.getQuantiteVendueKg());
                pickupItem.setQuantiteVendueKg(nouvelleQuantiteVendue);
                pickupItem.setResteAVendreKg(
                    pickupItem.getQuantiteKg().subtract(nouvelleQuantiteVendue));
                pickupItemRepository.save(pickupItem);
            }
        }
        
        // Générer les transactions comptables
        generateTransactionsFromVente(vente);
        
        // Mettre à jour le statut
        vente.setStatut(Vente.StatutVente.VALIDEE);
        Vente savedVente = venteRepository.save(vente);
        
        log.info("Vente validée : {}", savedVente.getNumeroVente());
        return venteMapper.toDTO(savedVente);
    }
    
    /**
     * Génère les transactions comptables depuis une vente
     */
    private void generateTransactionsFromVente(Vente vente) {
        // Récupérer la société depuis le premier pickup_item
        Societe societe = null;
        for (VenteItem item : vente.getItems()) {
            if (item.getPickupItem() != null && item.getPickupItem().getEnlevement() != null) {
                societe = item.getPickupItem().getEnlevement().getSociete();
                break;
            }
        }
        
        if (societe == null) {
            throw new IllegalStateException("Impossible de déterminer la société pour la vente");
        }
        
        // Créer une transaction par item
        for (VenteItem item : vente.getItems()) {
            Transaction transaction = Transaction.builder()
                    .type(Transaction.TypeTransaction.RECETTE)
                    .typeRecette(Transaction.TypeRecette.VENTE_MATIERE)
                    .montant(item.getMontantVenteMad())
                    .dateTransaction(vente.getDateVente())
                    .description(String.format("Vente %s - %s %s",
                        vente.getNumeroVente(), item.getTypeDechet(), 
                        item.getSousType() != null ? item.getSousType() : ""))
                    .categorie("Vente déchets")
                    .societe(societe)
                    .venteItem(item)
                    .statut(Transaction.StatutTransaction.EN_ATTENTE)
                    .createdBy(vente.getCreatedBy())
                    .build();
            
            transactionRepository.save(transaction);
        }
    }
    
    /**
     * Récupère les stocks disponibles à la vente
     */
    @Transactional(readOnly = true)
    public List<StockDisponibleDTO> getStocksDisponibles(Long societeId, String typeDechet, String sousType) {
        List<PickupItem> items = pickupItemRepository.findStocksDisponibles(
            societeId, 
            typeDechet, 
            sousType
        );
        
        return items.stream()
                .map(this::toStockDisponibleDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère une vente par ID
     */
    @Transactional(readOnly = true)
    public VenteDTO getVenteById(Long id) {
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vente non trouvée"));
        return venteMapper.toDTO(vente);
    }
    
    /**
     * Liste toutes les ventes avec pagination
     */
    @Transactional(readOnly = true)
    public Page<VenteDTO> getAllVentes(Pageable pageable) {
        return venteRepository.findAll(pageable)
                .map(venteMapper::toDTO);
    }
    
    /**
     * Liste les ventes par statut
     */
    @Transactional(readOnly = true)
    public Page<VenteDTO> getVentesByStatut(Vente.StatutVente statut, Pageable pageable) {
        return venteRepository.findByStatut(statut, pageable)
                .map(venteMapper::toDTO);
    }
    
    private String generateNumeroVente(Vente vente) {
        int year = vente.getDateVente() != null
                ? vente.getDateVente().getYear()
                : LocalDate.now().getYear();
        return "VENT-" + year + "-" + String.format("%06d", vente.getId());
    }
    
    private void createVenteItem(Vente vente, CreateVenteItemRequest request) {
        PickupItem pickupItem = null;
        if (request.getPickupItemId() != null) {
            pickupItem = pickupItemRepository.findById(request.getPickupItemId())
                    .orElseThrow(() -> new IllegalArgumentException("PickupItem non trouvé"));
        }
        
        VenteItem item = VenteItem.builder()
                .vente(vente)
                .pickupItem(pickupItem)
                .typeDechet(PickupItem.TypeDechet.valueOf(request.getTypeDechet()))
                .sousType(request.getSousType())
                .quantiteVendueKg(request.getQuantiteVendueKg())
                .prixVenteUnitaireMad(request.getPrixVenteUnitaireMad())
                .build();
        
        venteItemRepository.save(item);
    }
    
    private StockDisponibleDTO toStockDisponibleDTO(PickupItem item) {
        Enlevement enlevement = item.getEnlevement();
        return StockDisponibleDTO.builder()
                .pickupItemId(item.getId())
                .enlevementId(enlevement.getId())
                .numeroEnlevement(enlevement.getNumeroEnlevement())
                .dateEnlevement(enlevement.getDateEnlevement() != null 
                        ? enlevement.getDateEnlevement().toString() : null)
                .societeId(enlevement.getSociete().getId())
                .societeNom(enlevement.getSociete().getRaisonSociale())
                .typeDechet(item.getTypeDechet() != null ? item.getTypeDechet().name() : null)
                .sousType(item.getSousType())
                .quantiteRecupereeKg(item.getQuantiteKg())
                .quantiteVendueKg(item.getQuantiteVendueKg() != null 
                        ? item.getQuantiteVendueKg() : BigDecimal.ZERO)
                .resteAVendreKg(item.getResteAVendreKg())
                .statutStock(item.getStatutStock() != null ? item.getStatutStock().name() : null)
                .build();
    }
}

