package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO pour l'entité ClientUser
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientUserDTO {
    
    private Long id;
    private String nom;
    private String prenom;
    private String posteOccupe;
    private String email;
    private String telephone;
    private Long societeId;
    private String societeNom;
    private Boolean active;
    private Instant createdAt;
    
    // Nom complet calculé
    public String getFullName() {
        return prenom + " " + nom;
    }
}

