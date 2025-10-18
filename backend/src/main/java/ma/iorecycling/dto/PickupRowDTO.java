package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO pour les lignes du tableau des enlèvements
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupRowDTO {
    
    private Long id;
    private LocalDate date;
    private LocalTime heure;
    private String type;
    private BigDecimal tonnageKg;
    private String site;
    private List<DocDTO> documents;
    
    /**
     * Crée un PickupRowDTO à partir d'un Pickup
     */
    public static PickupRowDTO fromPickup(ma.iorecycling.entity.Pickup pickup, List<DocDTO> documents) {
        // Calculer le tonnage total
        BigDecimal tonnage = BigDecimal.ZERO;
        if (pickup.getKgValorisables() != null) {
            tonnage = tonnage.add(BigDecimal.valueOf(pickup.getKgValorisables()));
        }
        if (pickup.getKgBanals() != null) {
            tonnage = tonnage.add(BigDecimal.valueOf(pickup.getKgBanals()));
        }
        if (pickup.getKgDangereux() != null) {
            tonnage = tonnage.add(BigDecimal.valueOf(pickup.getKgDangereux()));
        }
        
        return PickupRowDTO.builder()
                .id(pickup.getId())
                .date(pickup.getDate())
                .heure(LocalTime.of(8, 0)) // Heure par défaut
                .type(pickup.getType().getDisplayName())
                .tonnageKg(tonnage)
                .site(pickup.getSite() != null ? pickup.getSite().getName() : "Non spécifié")
                .documents(documents)
                .build();
    }
}