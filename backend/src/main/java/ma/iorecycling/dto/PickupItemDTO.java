package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour l'entité PickupItem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupItemDTO {
    
    private Long id;
    private Long enlevementId;
    private String typeDechet;  // RECYCLABLE, BANAL, A_DETRUIRE
    private String sousType;
    private BigDecimal quantiteKg;
    private String uniteMesure;  // kg, L, m³, unité, etc.
    private String etat;  // vrac, compacté, broyé, Palettisé, autre
    private BigDecimal prixUnitaireMad;
    private BigDecimal montantMad;
    
    // NOUVEAUX CHAMPS - Prestation (tous types)
    private BigDecimal prixPrestationMad;
    private BigDecimal montantPrestationMad;
    
    // NOUVEAUX CHAMPS - Achat (valorisable)
    private BigDecimal prixAchatMad;
    private BigDecimal montantAchatMad;
    
    // NOUVEAUX CHAMPS - Traitement (banal)
    private BigDecimal prixTraitementMad;
    private BigDecimal montantTraitementMad;
    
    // NOUVEAUX CHAMPS - Suivi vente
    private BigDecimal quantiteVendueKg;
    private BigDecimal resteAVendreKg;
    private String statutStock; // NON_VENDU, PARTIELLEMENT_VENDU, VENDU
}

