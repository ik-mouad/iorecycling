package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO pour l'entité PlanningEnlevement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningEnlevementDTO {
    
    private Long id;
    private LocalDate datePrevue;
    private String heurePrevue;
    
    private Long siteId;
    private String siteNom;
    
    private Long societeId;
    private String societeNom;
    
    private String statut;  // PLANIFIE, CONFIRME, REALISE, ANNULE
    private String commentaire;
    
    private Long recurrenceId;
    private Long enlevementId;
    private String enlevementNumero;
    
    private Instant createdAt;
    private Instant updatedAt;
}

