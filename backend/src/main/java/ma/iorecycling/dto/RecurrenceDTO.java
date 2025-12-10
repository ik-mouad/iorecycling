package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO pour l'entité Recurrence
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurrenceDTO {
    
    private Long id;
    
    private Long societeId;
    private String societeNom;
    
    private Long siteId;
    private String siteNom;
    
    private String typeRecurrence;  // HEBDOMADAIRE, BIMENSUELLE, MENSUELLE, PERSONNALISEE
    private String jourSemaine;  // LUNDI, MARDI, etc.
    private String joursSemaneBimensuel;  // "LUNDI,JEUDI"
    private Integer jourMois;  // 1-31
    private String heurePrevue;
    
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Boolean active;
    
    private Instant createdAt;
    private Instant updatedAt;
}

