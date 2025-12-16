package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.TypeTraitement;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour l'entité Destination
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationDTO {
    
    private Long id;
    private String raisonSociale;
    private String site;
    private List<TypeTraitement> typesTraitement;
    private String nomInterlocuteur;
    private String telInterlocuteur;
    private String posteInterlocuteur;
    private String emailInterlocuteur;
    private String adresse;
    private String observation;
    private Instant createdAt;
    private Instant updatedAt;
}

