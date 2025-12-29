package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO pour l'entité Enlevement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnlevementDTO {
    
    private Long id;
    private String numeroEnlevement;
    private LocalDate dateEnlevement;
    private LocalTime heureEnlevement;
    private LocalDate dateDestination;
    private LocalTime heureDestination;
    
    // Informations société
    private Long societeId;
    private String societeNom;
    
    // Informations site
    private Long siteId;
    private String siteNom;
    
    private String observation;
    
    // Items détaillés
    private List<PickupItemDTO> items;
    
    // Calculs automatiques
    private BigDecimal poidsTotal;
    private BigDecimal budgetRecyclage;
    private BigDecimal budgetTraitement;
    private BigDecimal bilanNet;
    private Double tauxRecyclage;
    
    // Documents
    private List<DocumentDTO> documents;
    private Boolean bsdiPresent;
    private Boolean pvPresent;
    
    // Informations camion
    private Long camionId;
    private String camionMatricule;
    private String chauffeurNom;
    
    // Informations destination
    private Long destinationId;
    private String destinationRaisonSociale;
    private String destinationSite;
    private List<String> destinationTypesTraitement;
    private String destinationNomInterlocuteur;
    private String destinationTelInterlocuteur;
    
    // Transactions liées
    private List<TransactionDTO> transactions;
    
    // Métadonnées
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

