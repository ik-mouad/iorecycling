package ma.iorecycling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer une nouvelle société propriétaire
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSocieteProprietaireRequest {
    
    @NotBlank(message = "La raison sociale est obligatoire")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    private String raisonSociale;
    
    @Size(max = 100)
    private String contact;
    
    @Size(max = 20)
    private String telephone;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    private String email;
    
    @Size(max = 500)
    private String adresse;
    
    @Size(max = 1000)
    private String observation;
    
    private Boolean actif;
}

