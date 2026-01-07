package ma.iorecycling.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour représenter une politique Casbin
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CasbinPolicyDTO {
    
    @NotBlank(message = "Le rôle est obligatoire")
    private String role;
    
    @NotBlank(message = "La ressource est obligatoire")
    private String resource;
    
    @NotBlank(message = "L'action est obligatoire")
    private String action;
}

