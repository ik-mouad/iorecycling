package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service pour la génération automatique des transactions comptables
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionGenerationService {
    
    private final TransactionRepository transactionRepository;
    
    /**
     * Génère automatiquement les transactions comptables depuis un enlèvement
     */
    public void generateTransactionsFromEnlevement(Enlevement enlevement) {
        log.info("Génération des transactions pour l'enlèvement {}", enlevement.getNumeroEnlevement());
        
        // Supprimer les transactions existantes liées à cet enlèvement (si régénération)
        // Note: On suppose qu'il existe une méthode deleteByEnlevementId dans TransactionRepository
        // Si elle n'existe pas, il faudra l'ajouter
        List<Transaction> existingTransactions = transactionRepository.findByEnlevementId(enlevement.getId());
        if (!existingTransactions.isEmpty()) {
            transactionRepository.deleteAll(existingTransactions);
        }
        
        // Parcourir tous les items de l'enlèvement
        for (PickupItem item : enlevement.getItems()) {
            // Générer transaction DEPENSE (achat) si valorisable
            if (PickupItem.TypeDechet.RECYCLABLE.equals(item.getTypeDechet()) 
                    && item.getMontantAchatMad() != null 
                    && item.getMontantAchatMad().compareTo(BigDecimal.ZERO) > 0) {
                createTransaction(
                    Transaction.TypeTransaction.DEPENSE,
                    item.getMontantAchatMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Achat déchets %s - Enlèvement %s", 
                        item.getSousType(), enlevement.getNumeroEnlevement()),
                    "Achat déchets valorisables",
                    enlevement.getSociete(),
                    enlevement,
                    null // pas de type recette pour dépense
                );
            }
            
            // Générer transaction DEPENSE (traitement) si banal
            if ((PickupItem.TypeDechet.BANAL.equals(item.getTypeDechet()) 
                    || PickupItem.TypeDechet.A_DETRUIRE.equals(item.getTypeDechet()))
                    && item.getMontantTraitementMad() != null 
                    && item.getMontantTraitementMad().compareTo(BigDecimal.ZERO) > 0) {
                createTransaction(
                    Transaction.TypeTransaction.DEPENSE,
                    item.getMontantTraitementMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Traitement déchets %s - Enlèvement %s", 
                        item.getTypeDechet(), enlevement.getNumeroEnlevement()),
                    "Coût traitement déchets",
                    enlevement.getSociete(),
                    enlevement,
                    null
                );
            }
            
            // Générer transaction RECETTE PRESTATION si applicable
            if (item.getMontantPrestationMad() != null 
                    && item.getMontantPrestationMad().compareTo(BigDecimal.ZERO) > 0) {
                createTransaction(
                    Transaction.TypeTransaction.RECETTE,
                    item.getMontantPrestationMad(),
                    enlevement.getDateEnlevement(),
                    String.format("Prestation d'enlèvement %s - Enlèvement %s", 
                        item.getSousType() != null ? item.getSousType() : item.getTypeDechet(), 
                        enlevement.getNumeroEnlevement()),
                    "Prestation d'enlèvement",
                    enlevement.getSociete(),
                    enlevement,
                    Transaction.TypeRecette.PRESTATION
                );
            }
        }
        
        log.info("Transactions générées avec succès pour l'enlèvement {}", 
            enlevement.getNumeroEnlevement());
    }
    
    private Transaction createTransaction(
            Transaction.TypeTransaction type,
            BigDecimal montant,
            LocalDate dateTransaction,
            String description,
            String categorie,
            Societe societe,
            Enlevement enlevement,
            Transaction.TypeRecette typeRecette) {
        
        Transaction transaction = Transaction.builder()
            .type(type)
            .montant(montant)
            .dateTransaction(dateTransaction)
            .description(description)
            .categorie(categorie)
            .societe(societe)
            .enlevement(enlevement)
            .typeRecette(typeRecette)
            .statut(Transaction.StatutTransaction.EN_ATTENTE)
            .build();
        
        return transactionRepository.save(transaction);
    }
}

