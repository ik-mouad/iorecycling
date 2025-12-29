package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreatePaiementRequest;
import ma.iorecycling.dto.PaiementDTO;
import ma.iorecycling.entity.Echeance;
import ma.iorecycling.entity.Paiement;
import ma.iorecycling.entity.Transaction;
import ma.iorecycling.repository.EcheanceRepository;
import ma.iorecycling.repository.PaiementRepository;
import ma.iorecycling.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des paiements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaiementService {
    
    private final PaiementRepository paiementRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final EcheanceRepository echeanceRepository;
    
    /**
     * Crée un nouveau paiement
     */
    public PaiementDTO createPaiement(CreatePaiementRequest request, String createdBy) {
        log.info("Création d'un nouveau paiement pour transaction {}", request.getTransactionId());
        
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée: " + request.getTransactionId()));
        
        // Vérifier que le montant ne dépasse pas le montant restant
        if (request.getMontant().compareTo(transaction.getMontantRestant()) > 0) {
            throw new RuntimeException("Le montant du paiement ne peut pas dépasser le montant restant");
        }
        
        Paiement paiement = Paiement.builder()
                .transaction(transaction)
                .montant(request.getMontant())
                .datePaiement(request.getDatePaiement())
                .modePaiement(request.getModePaiement())
                .reference(request.getReference())
                .notes(request.getNotes())
                .statut(Paiement.StatutPaiement.VALIDE)
                .createdBy(createdBy)
                .build();
        
        paiement = paiementRepository.save(paiement);
        
        // Attribution automatique intelligente aux échéances
        attribuerPaiementAuxEcheances(paiement, transaction);
        
        // Mettre à jour le statut de la transaction
        transactionService.updateTransaction(transaction.getId(), 
                ma.iorecycling.dto.UpdateTransactionRequest.builder().build());
        
        log.info("Paiement créé avec ID {}", paiement.getId());
        return toDTO(paiement);
    }
    
    /**
     * Attribue automatiquement un paiement aux échéances en attente de manière intelligente
     * Logique :
     * 1. Si le montant correspond exactement à une échéance, l'attribuer à cette échéance
     * 2. Sinon, attribuer par ordre de date (plus anciennes d'abord) jusqu'à épuisement du montant
     * 3. Marquer les échéances comme PAYEE quand elles sont complètement couvertes
     */
    private void attribuerPaiementAuxEcheances(Paiement paiement, Transaction transaction) {
        // Récupérer toutes les échéances en attente de la transaction, triées par date
        List<Echeance> echeancesEnAttente = echeanceRepository
                .findEcheancesEnAttenteByTransactionId(transaction.getId());
        
        if (echeancesEnAttente.isEmpty()) {
            log.debug("Aucune échéance en attente pour la transaction {}", transaction.getId());
            return;
        }
        
        final BigDecimal montantPaiement = paiement.getMontant();
        BigDecimal montantRestant = montantPaiement;
        log.info("Attribution du paiement {} ({} MAD) aux échéances de la transaction {}", 
                paiement.getId(), montantPaiement, transaction.getId());
        
        // Stratégie 1 : Chercher une correspondance exacte de montant
        Echeance echeanceExacte = echeancesEnAttente.stream()
                .filter(e -> e.getMontant().compareTo(montantPaiement) == 0)
                .findFirst()
                .orElse(null);
        
        if (echeanceExacte != null) {
            // Correspondance exacte trouvée
            paiement.setEcheance(echeanceExacte);
            echeanceExacte.setStatut(Echeance.StatutEcheance.PAYEE);
            echeanceRepository.save(echeanceExacte);
            log.info("Paiement {} attribué à l'échéance {} (correspondance exacte de montant)", 
                    paiement.getId(), echeanceExacte.getId());
            return;
        }
        
        // Stratégie 2 : Attribution par ordre de date (plus anciennes d'abord)
        for (Echeance echeance : echeancesEnAttente) {
            if (montantRestant.compareTo(BigDecimal.ZERO) <= 0) {
                break; // Montant épuisé
            }
            
            BigDecimal montantEcheance = echeance.getMontant();
            
            if (montantRestant.compareTo(montantEcheance) >= 0) {
                // Le paiement couvre complètement cette échéance
                if (paiement.getEcheance() == null) {
                    // Lier le paiement à la première échéance qu'il couvre
                    paiement.setEcheance(echeance);
                }
                echeance.setStatut(Echeance.StatutEcheance.PAYEE);
                echeanceRepository.save(echeance);
                montantRestant = montantRestant.subtract(montantEcheance);
                log.info("Échéance {} marquée comme payée (montant: {} MAD)", 
                        echeance.getId(), montantEcheance);
            } else {
                // Le paiement couvre partiellement cette échéance
                // On marque quand même l'échéance comme payée si le montant restant est proche
                // (tolérance de 0.01 MAD pour les arrondis)
                if (montantRestant.add(new BigDecimal("0.01")).compareTo(montantEcheance) >= 0) {
                    if (paiement.getEcheance() == null) {
                        paiement.setEcheance(echeance);
                    }
                    echeance.setStatut(Echeance.StatutEcheance.PAYEE);
                    echeanceRepository.save(echeance);
                    log.info("Échéance {} marquée comme payée (paiement partiel: {} MAD sur {} MAD)", 
                            echeance.getId(), montantRestant, montantEcheance);
                } else {
                    // Le paiement ne couvre pas assez cette échéance, on s'arrête
                    log.debug("Paiement insuffisant pour couvrir l'échéance {} ({} MAD sur {} MAD requis)", 
                            echeance.getId(), montantRestant, montantEcheance);
                    break;
                }
                montantRestant = BigDecimal.ZERO;
            }
        }
        
        // Sauvegarder le paiement avec le lien vers l'échéance si attribué
        if (paiement.getEcheance() != null) {
            paiementRepository.save(paiement);
        }
        
        if (montantRestant.compareTo(BigDecimal.ZERO) > 0) {
            log.warn("Montant restant non attribué: {} MAD pour le paiement {}", 
                    montantRestant, paiement.getId());
        }
    }
    
    /**
     * Récupère un paiement par ID
     */
    @Transactional(readOnly = true)
    public PaiementDTO getPaiementById(Long id) {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + id));
        return toDTO(paiement);
    }
    
    /**
     * Liste les paiements d'une transaction
     */
    @Transactional(readOnly = true)
    public List<PaiementDTO> getPaiementsByTransaction(Long transactionId) {
        return paiementRepository.findByTransactionId(transactionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Liste les paiements d'une société
     */
    @Transactional(readOnly = true)
    public Page<PaiementDTO> getPaiementsBySociete(Long societeId, Pageable pageable) {
        return paiementRepository.findBySocieteId(societeId, pageable)
                .map(this::toDTO);
    }
    
    /**
     * Supprime un paiement
     */
    public void deletePaiement(Long id) {
        log.info("Suppression du paiement {}", id);
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + id));
        
        Long transactionId = paiement.getTransaction().getId();
        paiementRepository.delete(paiement);
        
        // Mettre à jour le statut de la transaction
        transactionService.updateTransaction(transactionId, 
                ma.iorecycling.dto.UpdateTransactionRequest.builder().build());
    }
    
    private PaiementDTO toDTO(Paiement paiement) {
        return PaiementDTO.builder()
                .id(paiement.getId())
                .transactionId(paiement.getTransaction().getId())
                .echeanceId(paiement.getEcheance() != null ? paiement.getEcheance().getId() : null)
                .montant(paiement.getMontant())
                .datePaiement(paiement.getDatePaiement())
                .modePaiement(paiement.getModePaiement())
                .reference(paiement.getReference())
                .notes(paiement.getNotes())
                .statut(paiement.getStatut())
                .createdBy(paiement.getCreatedBy())
                .createdAt(paiement.getCreatedAt())
                .updatedAt(paiement.getUpdatedAt())
                .build();
    }
}

