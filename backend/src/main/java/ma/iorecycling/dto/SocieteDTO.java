package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour l'entité Societe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocieteDTO {
    
    private Long id;
    private String raisonSociale;
    private String ice;
    private String email;
    private String telephone;
    private String commentaire;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Informations supplémentaires
    private Integer nbSites;
    private Integer nbUtilisateurs;
    private Integer nbEnlevements;
    
    // Listes détaillées (optionnelles selon le contexte)
    private List<SiteDTO> sites;
    private List<ClientUserDTO> utilisateurs;
}

