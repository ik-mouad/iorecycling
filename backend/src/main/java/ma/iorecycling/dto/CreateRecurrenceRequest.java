package ma.iorecycling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO pour créer une récurrence
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRecurrenceRequest {
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;
    
    @NotNull(message = "Le site est obligatoire")
    private Long siteId;
    
    @NotBlank(message = "Le type de récurrence est obligatoire")
    private String typeRecurrence;  // HEBDOMADAIRE, BIMENSUELLE, MENSUELLE
    
    @Size(max = 20)
    private String jourSemaine;  // LUNDI, MARDI, etc. (pour HEBDOMADAIRE)
    
    @Size(max = 50)
    private String joursSemaneBimensuel;  // "LUNDI,JEUDI" (pour BIMENSUELLE)
    
    private Integer jourMois;  // 1-31 (pour MENSUELLE)
    
    @Size(max = 50)
    private String heurePrevue;
    
    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;
    
    private LocalDate dateFin;  // Null = sans fin
}

