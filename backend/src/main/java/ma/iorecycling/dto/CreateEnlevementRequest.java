package ma.iorecycling.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour créer un nouvel enlèvement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnlevementRequest {
    
    @NotNull(message = "La date de l'enlèvement est obligatoire")
    private LocalDate dateEnlevement;
    
    @NotNull(message = "Le site est obligatoire")
    private Long siteId;
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;
    
    @Size(max = 1000)
    private String observation;
    
    @NotEmpty(message = "Au moins un item est obligatoire")
    @Valid
    private List<CreatePickupItemRequest> items;
}

