package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO pour valider une demande avec possibilité de modifier la date/heure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValiderDemandeRequest {
    
    /**
     * Date modifiée (optionnel, utilise la date originale si null)
     */
    private LocalDate dateModifiee;
    
    /**
     * Heure modifiée (optionnel, utilise l'heure originale si null)
     */
    private String heureModifiee;
}

