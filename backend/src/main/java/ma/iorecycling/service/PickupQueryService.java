package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.PickupItemRepository;
import ma.iorecycling.repository.PickupRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PickupQueryService {
    
    private final PickupRepository pickupRepository;
    private final PickupItemRepository pickupItemRepository;
    private final StorageService storageService;
    
    /**
     * Liste les enlèvements d'un client avec pagination et filtrage
     */
    public Page<PickupRowDTO> listPickups(Long clientId, @Nullable PickupType filter, Pageable pageable) {
        log.debug("Récupération des enlèvements pour client {} avec filtre {}", clientId, filter);
        
        Page<Pickup> pickups;
        if (filter != null && filter != PickupType.ALL) {
            pickups = pickupRepository.findByClientIdAndTypeOrderByDateDesc(clientId, filter, pageable);
        } else {
            pickups = pickupRepository.findByClientIdOrderByDateDesc(clientId, pageable);
        }
        
        return pickups.map(this::mapToPickupRowDTO);
    }
    
    /**
     * Calcule le résumé de valorisation pour un mois donné
     */
    public ValorSummaryDTO valorSummary(Long clientId, YearMonth month) {
        log.debug("Calcul du résumé de valorisation pour client {} et mois {}", clientId, month);
        
        // Période du mois
        Instant from = month.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = month.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        
        // Récupérer les items valorisables pour la période
        List<PickupItem> items = pickupItemRepository.findByPickupClientIdAndPickupDateBetweenAndPickupType(
            clientId, from, to, PickupType.RECYCLABLE
        );
        
        // Grouper par matériau et calculer les totaux
        Map<String, List<PickupItem>> groupedByMaterial = items.stream()
            .collect(Collectors.groupingBy(PickupItem::getMaterial));
        
        List<ValorSummaryRowDTO> rows = groupedByMaterial.entrySet().stream()
            .map(entry -> {
                String material = entry.getKey();
                List<PickupItem> materialItems = entry.getValue();
                
                // Calculer la quantité totale
                BigDecimal totalQty = materialItems.stream()
                    .map(PickupItem::getQtyKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                // Calculer le prix moyen pondéré
                BigDecimal totalValue = materialItems.stream()
                    .map(item -> item.getQtyKg().multiply(item.getPriceMadPerKg()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                BigDecimal avgPrice = totalQty.compareTo(BigDecimal.ZERO) > 0 ? 
                    totalValue.divide(totalQty, 2, RoundingMode.HALF_UP) : 
                    BigDecimal.ZERO;
                
                return ValorSummaryRowDTO.builder()
                    .material(material)
                    .qtyKg(totalQty)
                    .pricePerKg(avgPrice)
                    .totalMad(totalValue)
                    .build();
            })
            .sorted((a, b) -> b.getTotalMad().compareTo(a.getTotalMad())) // Tri par total décroissant
            .collect(Collectors.toList());
        
        // Calculer le total général
        BigDecimal grandTotal = rows.stream()
            .map(ValorSummaryRowDTO::getTotalMad)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new ValorSummaryDTO(
            month.toString(),
            rows,
            grandTotal,
            "MAD"
        );
    }
    
    /**
     * Mappe une entité Pickup vers PickupRowDTO
     */
    private PickupRowDTO mapToPickupRowDTO(Pickup pickup) {
        // Calculer le tonnage selon le type
        Double tonnage = calculateTonnage(pickup);
        
        // Mapper les documents
        List<DocDTO> documents = pickup.getDocuments().stream()
            .map(doc -> DocDTO.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .type(doc.getDocType())
                .mime(doc.getMimeType())
                .url(storageService.getPresignedUrl(doc.getObjectKey(), 5)) // URL valide 5 minutes
                .build())
            .collect(Collectors.toList());
        
        return PickupRowDTO.builder()
            .id(pickup.getId())
            .date(pickup.getDate())
            .heure(java.time.LocalTime.of(8, 0)) // Heure par défaut
            .type(pickup.getType().name())
            .tonnageKg(BigDecimal.valueOf(tonnage))
            .site(pickup.getSite() != null ? pickup.getSite().getName() : "Non spécifié")
            .documents(documents)
            .build();
    }
    
    /**
     * Calcule le tonnage selon le type d'enlèvement
     */
    private Double calculateTonnage(Pickup pickup) {
        return switch (pickup.getType()) {
            case ALL -> 0.0; // ALL n'est pas utilisé pour les calculs individuels
            case RECYCLABLE -> {
                // Si on a des items détaillés, utiliser leur somme
                if (!pickup.getItems().isEmpty()) {
                    yield pickup.getItems().stream()
                        .mapToDouble(item -> item.getQtyKg().doubleValue())
                        .sum();
                }
                // Sinon, utiliser le champ kgValorisables
                yield pickup.getKgValorisables() != null ? pickup.getKgValorisables() : 0.0;
            }
            case BANAL -> pickup.getKgBanals() != null ? pickup.getKgBanals() : 0.0;
            case DANGEREUX -> pickup.getKgDangereux() != null ? pickup.getKgDangereux() : 0.0;
        };
    }
}
