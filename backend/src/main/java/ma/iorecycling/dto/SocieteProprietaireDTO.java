package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO pour l'entité SocieteProprietaire
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocieteProprietaireDTO {
    
    private Long id;
    private String raisonSociale;
    private String contact;
    private String telephone;
    private String email;
    private String adresse;
    private String observation;
    private Boolean actif;
    private Instant createdAt;
    private Instant updatedAt;
}

