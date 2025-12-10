package ma.iorecycling.mapper;

import ma.iorecycling.dto.EnlevementDTO;
import ma.iorecycling.dto.PickupItemDTO;
import ma.iorecycling.entity.Enlevement;
import ma.iorecycling.entity.PickupItem;
import ma.iorecycling.entity.PickupItem.TypeDechet;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

/**
 * Mapper pour l'entité Enlevement
 */
@Component
public class EnlevementMapper {
    
    public EnlevementDTO toDTO(Enlevement enlevement) {
        if (enlevement == null) {
            return null;
        }
        
        // Calculs
        BigDecimal poidsTotal = enlevement.getItems().stream()
                .map(PickupItem::getQuantiteKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal budgetRecyclage = enlevement.getItems().stream()
                .filter(item -> TypeDechet.VALORISABLE.equals(item.getTypeDechet()))
                .map(PickupItem::getMontantMad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal budgetTraitement = enlevement.getItems().stream()
                .filter(item -> TypeDechet.BANAL.equals(item.getTypeDechet()) || 
                               TypeDechet.A_ELIMINER.equals(item.getTypeDechet()))
                .map(PickupItem::getMontantMad)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal bilanNet = budgetRecyclage.subtract(budgetTraitement);
        
        BigDecimal poidsRecyclable = enlevement.getItems().stream()
                .filter(item -> TypeDechet.VALORISABLE.equals(item.getTypeDechet()))
                .map(PickupItem::getQuantiteKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Double tauxRecyclage = poidsTotal.compareTo(BigDecimal.ZERO) > 0 
                ? poidsRecyclable.divide(poidsTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        
        return EnlevementDTO.builder()
                .id(enlevement.getId())
                .numeroEnlevement(enlevement.getNumeroEnlevement())
                .dateEnlevement(enlevement.getDateEnlevement())
                .societeId(enlevement.getSociete().getId())
                .societeNom(enlevement.getSociete().getRaisonSociale())
                .siteId(enlevement.getSite().getId())
                .siteNom(enlevement.getSite().getName())
                .observation(enlevement.getObservation())
                .items(enlevement.getItems().stream()
                        .map(this::toItemDTO)
                        .collect(Collectors.toList()))
                .poidsTotal(poidsTotal)
                .budgetRecyclage(budgetRecyclage)
                .budgetTraitement(budgetTraitement)
                .bilanNet(bilanNet)
                .tauxRecyclage(tauxRecyclage)
                .createdBy(enlevement.getCreatedBy())
                .createdAt(enlevement.getCreatedAt())
                .updatedAt(enlevement.getUpdatedAt())
                .build();
    }
    
    private PickupItemDTO toItemDTO(PickupItem item) {
        // Mapping entre backend (A_ELIMINER) et frontend (A_DETRUIRE)
        String typeDechet = item.getTypeDechet().name();
        if ("A_ELIMINER".equals(typeDechet)) {
            typeDechet = "A_DETRUIRE";
        }
        
        return PickupItemDTO.builder()
                .id(item.getId())
                .enlevementId(item.getEnlevement().getId())
                .typeDechet(typeDechet)
                .sousType(item.getSousType())
                .quantiteKg(item.getQuantiteKg())
                .uniteMesure(item.getUniteMesure() != null ? item.getUniteMesure() : "kg")
                .etat(item.getEtat())
                .prixUnitaireMad(item.getPrixUnitaireMad())
                .montantMad(item.getMontantMad())
                .build();
    }
}

