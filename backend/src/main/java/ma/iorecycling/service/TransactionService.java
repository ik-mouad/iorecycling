package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.*;
import ma.iorecycling.entity.*;
import ma.iorecycling.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des transactions comptables
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final SocieteRepository societeRepository;
    private final EnlevementRepository enlevementRepository;
    private final EcheanceRepository echeanceRepository;
    
    /**
     * Crée une nouvelle transaction avec ses échéances éventuelles
     */
    public TransactionDTO createTransaction(CreateTransactionRequest request, String createdBy) {
        log.info("Création d'une nouvelle transaction de type {} pour société {}", 
                request.getType(), request.getSocieteId());
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new RuntimeException("Société non trouvée: " + request.getSocieteId()));
        
        // Vérifier l'enlèvement si fourni
        Enlevement enlevement = null;
        if (request.getEnlevementId() != null) {
            enlevement = enlevementRepository.findById(request.getEnlevementId())
                    .orElseThrow(() -> new RuntimeException("Enlèvement non trouvé: " + request.getEnlevementId()));
        }
        
        // Créer la transaction
        Transaction transaction = Transaction.builder()
                .type(request.getType())
                .montant(request.getMontant())
                .dateTransaction(request.getDateTransaction())
                .description(request.getDescription())
                .categorie(request.getCategorie())
                .numeroReference(request.getNumeroReference())
                .societe(societe)
                .enlevement(enlevement)
                .notes(request.getNotes())
                .statut(Transaction.StatutTransaction.EN_ATTENTE)
                .createdBy(createdBy)
                .build();
        
        // Ajouter les échéances si fournies
        if (request.getEcheances() != null && !request.getEcheances().isEmpty()) {
            for (CreateEcheanceRequest echeanceReq : request.getEcheances()) {
                Echeance echeance = Echeance.builder()
                        .transaction(transaction)
                        .montant(echeanceReq.getMontant())
                        .dateEcheance(echeanceReq.getDateEcheance())
                        .statut(Echeance.StatutEcheance.EN_ATTENTE)
                        .build();
                transaction.addEcheance(echeance);
            }
        }
        
        transaction = transactionRepository.save(transaction);
        log.info("Transaction créée avec ID {}", transaction.getId());
        
        return toDTO(transaction);
    }
    
    /**
     * Met à jour une transaction
     */
    public TransactionDTO updateTransaction(Long id, UpdateTransactionRequest request) {
        log.info("Mise à jour de la transaction {}", id);
        
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée: " + id));
        
        if (request.getMontant() != null) {
            transaction.setMontant(request.getMontant());
        }
        if (request.getDateTransaction() != null) {
            transaction.setDateTransaction(request.getDateTransaction());
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getCategorie() != null) {
            transaction.setCategorie(request.getCategorie());
        }
        if (request.getNumeroReference() != null) {
            transaction.setNumeroReference(request.getNumeroReference());
        }
        if (request.getNotes() != null) {
            transaction.setNotes(request.getNotes());
        }
        if (request.getStatut() != null) {
            transaction.setStatut(request.getStatut());
        }
        
        // Mettre à jour le statut automatiquement selon les paiements
        updateStatutTransaction(transaction);
        
        transaction = transactionRepository.save(transaction);
        return toDTO(transaction);
    }
    
    /**
     * Récupère une transaction par ID
     */
    @Transactional(readOnly = true)
    public TransactionDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée: " + id));
        return toDTO(transaction);
    }
    
    /**
     * Liste les transactions d'une société
     */
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactionsBySociete(Long societeId, Transaction.TypeTransaction type, 
                                                         Pageable pageable) {
        Page<Transaction> transactions;
        if (type != null) {
            transactions = transactionRepository.findBySocieteIdAndType(societeId, type, pageable);
        } else {
            transactions = transactionRepository.findBySocieteId(societeId, pageable);
        }
        return transactions.map(this::toDTO);
    }
    
    /**
     * Supprime une transaction
     */
    public void deleteTransaction(Long id) {
        log.info("Suppression de la transaction {}", id);
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction non trouvée: " + id));
        transactionRepository.delete(transaction);
    }
    
    /**
     * Liste les transactions impayées d'une société
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsImpayees(Long societeId) {
        log.info("Récupération des transactions impayées pour société {}", societeId);
        List<Transaction> transactions = transactionRepository.findTransactionsImpayees(societeId);
        return transactions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Met à jour le statut d'une transaction selon ses paiements
     */
    private void updateStatutTransaction(Transaction transaction) {
        BigDecimal montantPaye = transaction.getMontantPaye();
        BigDecimal montant = transaction.getMontant();
        
        if (transaction.getStatut() == Transaction.StatutTransaction.ANNULEE) {
            return; // Ne pas modifier si annulée
        }
        
        if (montantPaye.compareTo(BigDecimal.ZERO) == 0) {
            transaction.setStatut(Transaction.StatutTransaction.EN_ATTENTE);
        } else if (montantPaye.compareTo(montant) >= 0) {
            transaction.setStatut(Transaction.StatutTransaction.PAYEE);
        } else {
            transaction.setStatut(Transaction.StatutTransaction.PARTIELLEMENT_PAYEE);
        }
    }
    
    /**
     * Convertit une entité Transaction en DTO
     */
    private TransactionDTO toDTO(Transaction transaction) {
        TransactionDTO dto = TransactionDTO.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .montant(transaction.getMontant())
                .dateTransaction(transaction.getDateTransaction())
                .description(transaction.getDescription())
                .categorie(transaction.getCategorie())
                .numeroReference(transaction.getNumeroReference())
                .societeId(transaction.getSociete().getId())
                .societeNom(transaction.getSociete().getRaisonSociale())
                .notes(transaction.getNotes())
                .statut(transaction.getStatut())
                .createdBy(transaction.getCreatedBy())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
        
        if (transaction.getEnlevement() != null) {
            dto.setEnlevementId(transaction.getEnlevement().getId());
            dto.setEnlevementNumero(transaction.getEnlevement().getNumeroEnlevement());
        }
        
        // Calculs automatiques
        dto.setMontantPaye(transaction.getMontantPaye());
        dto.setMontantRestant(transaction.getMontantRestant());
        dto.setCompletementPayee(transaction.isCompletementPayee());
        
        // Paiements
        dto.setPaiements(transaction.getPaiements().stream()
                .map(this::paiementToDTO)
                .collect(Collectors.toList()));
        
        // Échéances
        dto.setEcheances(transaction.getEcheances().stream()
                .map(this::echeanceToDTO)
                .collect(Collectors.toList()));
        
        return dto;
    }
    
    private PaiementDTO paiementToDTO(Paiement paiement) {
        return PaiementDTO.builder()
                .id(paiement.getId())
                .transactionId(paiement.getTransaction().getId())
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
    
    private EcheanceDTO echeanceToDTO(Echeance echeance) {
        return EcheanceDTO.builder()
                .id(echeance.getId())
                .transactionId(echeance.getTransaction().getId())
                .montant(echeance.getMontant())
                .dateEcheance(echeance.getDateEcheance())
                .statut(echeance.getStatut())
                .createdAt(echeance.getCreatedAt())
                .updatedAt(echeance.getUpdatedAt())
                .build();
    }
}

