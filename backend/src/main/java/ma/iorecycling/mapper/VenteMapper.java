package ma.iorecycling.mapper;

import ma.iorecycling.dto.VenteDTO;
import ma.iorecycling.dto.VenteItemDTO;
import ma.iorecycling.entity.Vente;
import ma.iorecycling.entity.VenteItem;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper pour l'entité Vente
 */
@Component
public class VenteMapper {
    
    public VenteDTO toDTO(Vente vente) {
        if (vente == null) {
            return null;
        }
        
        return VenteDTO.builder()
                .id(vente.getId())
                .numeroVente(vente.getNumeroVente())
                .dateVente(vente.getDateVente())
                .acheteurId(vente.getAcheteurId())
                .acheteurNom(vente.getAcheteurNom())
                .observation(vente.getObservation())
                .statut(vente.getStatut() != null ? vente.getStatut().name() : null)
                .items(vente.getItems().stream()
                        .map(this::toItemDTO)
                        .collect(Collectors.toList()))
                .createdBy(vente.getCreatedBy())
                .createdAt(vente.getCreatedAt())
                .updatedAt(vente.getUpdatedAt())
                .build();
    }
    
    private VenteItemDTO toItemDTO(VenteItem item) {
        return VenteItemDTO.builder()
                .id(item.getId())
                .venteId(item.getVente().getId())
                .pickupItemId(item.getPickupItem() != null ? item.getPickupItem().getId() : null)
                .typeDechet(item.getTypeDechet() != null ? item.getTypeDechet().name() : null)
                .sousType(item.getSousType())
                .quantiteVendueKg(item.getQuantiteVendueKg())
                .prixVenteUnitaireMad(item.getPrixVenteUnitaireMad())
                .montantVenteMad(item.getMontantVenteMad())
                .createdAt(item.getCreatedAt())
                .build();
    }
}

