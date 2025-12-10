package ma.iorecycling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer un nouveau site pour une société
 * Le societeId vient de l'URL, donc pas besoin de le valider ici
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSiteForSocieteRequest {
    
    @NotBlank(message = "Le nom du site est obligatoire")
    @Size(max = 100)
    private String name;
    
    private String adresse;
}

