package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour l'entité Vente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteDTO {
    
    private Long id;
    private String numeroVente;
    private LocalDate dateVente;
    private Long acheteurId;
    private String acheteurNom;
    private String observation;
    private String statut; // BROUILLON, VALIDEE, ANNULEE
    
    // Items de la vente
    private List<VenteItemDTO> items;
    
    // Métadonnées
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

