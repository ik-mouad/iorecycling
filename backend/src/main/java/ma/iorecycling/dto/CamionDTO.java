package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.TypeCamion;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO pour l'entité Camion
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CamionDTO {
    
    private Long id;
    private String matricule;
    private BigDecimal tonnageMaxKg;
    private TypeCamion typeCamion;
    private String observation;
    
    // Informations société propriétaire
    private Long societeProprietaireId;
    private String societeProprietaireNom;
    
    private Boolean actif;
    private Instant createdAt;
    private Instant updatedAt;
}

