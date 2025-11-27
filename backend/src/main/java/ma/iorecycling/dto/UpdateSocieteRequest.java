package ma.iorecycling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour mettre à jour une société (ICE non modifiable)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSocieteRequest {
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    private String raisonSociale;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    private String email;
    
    @Size(max = 20)
    private String telephone;
    
    private String commentaire;
}

