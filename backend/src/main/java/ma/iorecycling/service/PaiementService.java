package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreatePaiementRequest;
import ma.iorecycling.dto.PaiementDTO;
import ma.iorecycling.entity.Paiement;
import ma.iorecycling.entity.Transaction;
import ma.iorecycling.repository.PaiementRepository;
import ma.iorecycling.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        
        // Mettre à jour le statut de la transaction
        transactionService.updateTransaction(transaction.getId(), 
                ma.iorecycling.dto.UpdateTransactionRequest.builder().build());
        
        log.info("Paiement créé avec ID {}", paiement.getId());
        return toDTO(paiement);
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

