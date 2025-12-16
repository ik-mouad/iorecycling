package ma.iorecycling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.TypeTraitement;

import java.util.List;

/**
 * DTO pour créer une nouvelle destination
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDestinationRequest {
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    private String raisonSociale;
    
    @NotBlank(message = "Le site est obligatoire")
    @Size(max = 255, message = "Le site ne peut pas dépasser 255 caractères")
    private String site;
    
    @NotEmpty(message = "Au moins un type de traitement est obligatoire")
    private List<TypeTraitement> typesTraitement;
    
    @Size(max = 100)
    private String nomInterlocuteur;
    
    @Size(max = 20)
    private String telInterlocuteur;
    
    @Size(max = 100)
    private String posteInterlocuteur;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    private String emailInterlocuteur;
    
    @Size(max = 500)
    private String adresse;
    
    @Size(max = 1000)
    private String observation;
}

