package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO pour l'entité DemandeEnlevement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeEnlevementDTO {
    
    private Long id;
    private String numeroDemande;
    private LocalDate dateSouhaitee;
    private String heureSouhaitee;
    
    private Long siteId;
    private String siteNom;
    
    private Long societeId;
    private String societeNom;
    
    private String typeDechetEstime;
    private Double quantiteEstimee;
    private String commentaire;
    
    private String statut;  // EN_ATTENTE, VALIDEE, PLANIFIEE, REALISEE, REFUSEE, ANNULEE
    private String motifRefus;
    
    private LocalDateTime dateCreation;
    private LocalDateTime dateTraitement;
    
    private String createdBy;
    private String treatedBy;
}

