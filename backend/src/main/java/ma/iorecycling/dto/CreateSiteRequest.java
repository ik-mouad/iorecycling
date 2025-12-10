package ma.iorecycling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour créer un nouveau site
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSiteRequest {
    
    @NotNull(message = "La société est obligatoire")
    private Long societeId;
    
    @NotBlank(message = "Le nom du site est obligatoire")
    @Size(max = 100)
    private String name;
    
    private String adresse;
}

