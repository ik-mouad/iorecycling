package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.iorecycling.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour l'entité Transaction
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    
    private Long id;
    private Transaction.TypeTransaction type;
    private BigDecimal montant;
    private LocalDate dateTransaction;
    private String description;
    private String categorie;
    private String numeroReference;
    
    // Informations société
    private Long societeId;
    private String societeNom;
    
    // Information enlèvement (optionnel)
    private Long enlevementId;
    private String enlevementNumero;
    
    // NOUVEAU CHAMP - Type de recette
    private Transaction.TypeRecette typeRecette;
    
    // NOUVEAU CHAMP - Information vente (optionnel)
    private Long venteItemId;
    private Long venteId;
    private String venteNumero;
    
    private String notes;
    private Transaction.StatutTransaction statut;
    
    // Calculs automatiques
    private BigDecimal montantPaye;
    private BigDecimal montantRestant;
    private Boolean completementPayee;
    
    // Paiements et échéances
    private List<PaiementDTO> paiements;
    private List<EcheanceDTO> echeances;
    
    // Métadonnées
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

