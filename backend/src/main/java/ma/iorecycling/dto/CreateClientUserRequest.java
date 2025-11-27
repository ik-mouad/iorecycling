package ma.iorecycling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer un nouvel utilisateur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClientUserRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String nom;
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100)
    private String prenom;
    
    @Size(max = 100)
    private String posteOccupe;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    private String email;
    
    @Size(max = 20)
    private String telephone;
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;

    @Size(min = 8, max = 64, message = "Le mot de passe doit contenir entre 8 et 64 caractères")
    private String password;

    @Builder.Default
    private Boolean temporaryPassword = true;
}

