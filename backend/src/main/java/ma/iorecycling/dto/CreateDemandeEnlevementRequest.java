package ma.iorecycling.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO pour créer une demande d'enlèvement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDemandeEnlevementRequest {
    
    @NotNull(message = "La date souhaitée est obligatoire")
    private LocalDate dateSouhaitee;
    
    @Size(max = 50)
    private String heureSouhaitee;
    
    @NotNull(message = "Le site est obligatoire")
    private Long siteId;
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;
    
    @Size(max = 100)
    private String typeDechetEstime;
    
    @PositiveOrZero
    private Double quantiteEstimee;
    
    @Size(max = 1000)
    private String commentaire;
}

