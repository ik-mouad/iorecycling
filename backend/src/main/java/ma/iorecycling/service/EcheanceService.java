package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.EcheanceDTO;
import ma.iorecycling.entity.Echeance;
import ma.iorecycling.repository.EcheanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des échéances
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EcheanceService {
    
    private final EcheanceRepository echeanceRepository;
    
    /**
     * Récupère une échéance par ID
     */
    @Transactional(readOnly = true)
    public EcheanceDTO getEcheanceById(Long id) {
        Echeance echeance = echeanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Échéance non trouvée: " + id));
        return toDTO(echeance);
    }
    
    /**
     * Liste les échéances d'une transaction
     */
    @Transactional(readOnly = true)
    public List<EcheanceDTO> getEcheancesByTransaction(Long transactionId) {
        return echeanceRepository.findByTransactionId(transactionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Liste les échéances en retard d'une société
     */
    @Transactional(readOnly = true)
    public List<EcheanceDTO> getEcheancesEnRetard(Long societeId) {
        LocalDate aujourdhui = LocalDate.now();
        return echeanceRepository.findEcheancesEnRetard(societeId, aujourdhui).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Liste les échéances à venir d'une société
     */
    @Transactional(readOnly = true)
    public List<EcheanceDTO> getEcheancesAVenir(Long societeId, LocalDate dateDebut, LocalDate dateFin) {
        return echeanceRepository.findEcheancesAVenir(societeId, dateDebut, dateFin).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Marque une échéance comme payée
     */
    public EcheanceDTO marquerEcheancePayee(Long id) {
        log.info("Marquage de l'échéance {} comme payée", id);
        Echeance echeance = echeanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Échéance non trouvée: " + id));
        
        echeance.setStatut(Echeance.StatutEcheance.PAYEE);
        echeance = echeanceRepository.save(echeance);
        
        return toDTO(echeance);
    }
    
    /**
     * Marque une échéance comme impayée (dépassée)
     */
    public EcheanceDTO marquerEcheanceImpayee(Long id) {
        log.info("Marquage de l'échéance {} comme impayée", id);
        Echeance echeance = echeanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Échéance non trouvée: " + id));
        
        echeance.setStatut(Echeance.StatutEcheance.IMPAYEE);
        echeance = echeanceRepository.save(echeance);
        
        return toDTO(echeance);
    }
    
    /**
     * Supprime une échéance
     */
    public void deleteEcheance(Long id) {
        log.info("Suppression de l'échéance {}", id);
        Echeance echeance = echeanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Échéance non trouvée: " + id));
        echeanceRepository.delete(echeance);
    }
    
    private EcheanceDTO toDTO(Echeance echeance) {
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

