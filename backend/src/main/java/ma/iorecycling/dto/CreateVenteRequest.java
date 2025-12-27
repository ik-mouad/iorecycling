package ma.iorecycling.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour la création d'une vente
 */
@Data
public class CreateVenteRequest {
    
    @NotNull(message = "La date de vente est obligatoire")
    private LocalDate dateVente;
    
    private Long acheteurId;
    private String acheteurNom;
    private String observation;
    
    @NotEmpty(message = "Au moins un item est requis")
    @Valid
    private List<CreateVenteItemRequest> items;
}

