package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO pour l'entité Site
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteDTO {
    
    private Long id;
    private Long societeId;
    private String societeNom;
    private String name;
    private String adresse;
    private Instant createdAt;
    
    // Informations supplémentaires
    private Integer nbEnlevements;
}

