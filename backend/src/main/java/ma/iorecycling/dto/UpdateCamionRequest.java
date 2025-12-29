package ma.iorecycling.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.TypeCamion;

import java.math.BigDecimal;

/**
 * DTO pour mettre à jour un camion
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCamionRequest {
    
    @NotNull(message = "Le tonnage maximum est obligatoire")
    @DecimalMin(value = "0.01", message = "Le tonnage maximum doit être supérieur à 0")
    private BigDecimal tonnageMaxKg;
    
    @NotNull(message = "Le type de camion est obligatoire")
    private TypeCamion typeCamion;
    
    @Size(max = 1000, message = "L'observation ne peut pas dépasser 1000 caractères")
    private String observation;
    
    @NotNull(message = "La société propriétaire est obligatoire")
    private Long societeProprietaireId;
    
    @NotNull(message = "Le statut actif est obligatoire")
    private Boolean actif;
}

