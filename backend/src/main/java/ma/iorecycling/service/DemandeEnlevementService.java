package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateDemandeEnlevementRequest;
import ma.iorecycling.dto.DemandeEnlevementDTO;
import ma.iorecycling.entity.DemandeEnlevement;
import ma.iorecycling.entity.DemandeEnlevement.StatutDemande;
import ma.iorecycling.entity.Site;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.DemandeEnlevementRepository;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des demandes d'enlèvements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DemandeEnlevementService {
    
    private final DemandeEnlevementRepository demandeRepository;
    private final SocieteRepository societeRepository;
    private final SiteRepository siteRepository;
    
    /**
     * Crée une nouvelle demande d'enlèvement
     */
    public DemandeEnlevementDTO createDemande(CreateDemandeEnlevementRequest request, String createdBy) {
        log.info("Création d'une nouvelle demande pour société {}", request.getSocieteId());
        
        // Vérifier que la société existe
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        // Vérifier que le site existe et appartient à la société
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
        
        if (!site.getSociete().getId().equals(societe.getId())) {
            throw new IllegalArgumentException("Le site ne correspond pas à la société");
        }
        
        DemandeEnlevement demande = DemandeEnlevement.builder()
                .dateSouhaitee(request.getDateSouhaitee())
                .heureSouhaitee(request.getHeureSouhaitee())
                .site(site)
                .societe(societe)
                .typeDechetEstime(request.getTypeDechetEstime())
                .quantiteEstimee(request.getQuantiteEstimee())
                .commentaire(request.getCommentaire())
                .statut(StatutDemande.EN_ATTENTE)
                .createdBy(createdBy)
                .build();
        
        DemandeEnlevement savedDemande = demandeRepository.save(demande);
        
        log.info("Demande créée avec succès : {}", savedDemande.getNumeroDemande());
        return toDTO(savedDemande);
    }
    
    /**
     * Récupère les demandes d'une société
     */
    @Transactional(readOnly = true)
    public Page<DemandeEnlevementDTO> getDemandesBySociete(Long societeId, Pageable pageable) {
        return demandeRepository.findBySocieteIdOrderByDateCreationDesc(societeId, pageable)
                .map(this::toDTO);
    }
    
    /**
     * Récupère toutes les demandes EN_ATTENTE
     */
    @Transactional(readOnly = true)
    public List<DemandeEnlevementDTO> getDemandesEnAttente() {
        return demandeRepository.findDemandesEnAttente().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Valide une demande
     */
    public DemandeEnlevementDTO validerDemande(Long id, String treatedBy) {
        log.info("Validation de la demande ID {}", id);
        
        DemandeEnlevement demande = demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new IllegalStateException("Seules les demandes EN_ATTENTE peuvent être validées");
        }
        
        demande.setStatut(StatutDemande.VALIDEE);
        demande.setTreatedBy(treatedBy);
        
        DemandeEnlevement savedDemande = demandeRepository.save(demande);
        
        log.info("Demande validée : {}", savedDemande.getNumeroDemande());
        return toDTO(savedDemande);
    }
    
    /**
     * Refuse une demande
     */
    public DemandeEnlevementDTO refuserDemande(Long id, String motifRefus, String treatedBy) {
        log.info("Refus de la demande ID {}", id);
        
        DemandeEnlevement demande = demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new IllegalStateException("Seules les demandes EN_ATTENTE peuvent être refusées");
        }
        
        demande.setStatut(StatutDemande.REFUSEE);
        demande.setMotifRefus(motifRefus);
        demande.setTreatedBy(treatedBy);
        
        DemandeEnlevement savedDemande = demandeRepository.save(demande);
        
        log.info("Demande refusée : {}", savedDemande.getNumeroDemande());
        return toDTO(savedDemande);
    }
    
    /**
     * Annule une demande (par le client)
     */
    public DemandeEnlevementDTO annulerDemande(Long id, Long societeId) {
        log.info("Annulation de la demande ID {} par société {}", id, societeId);
        
        DemandeEnlevement demande = demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        // Vérifier que la demande appartient bien à la société
        if (!demande.getSociete().getId().equals(societeId)) {
            throw new IllegalArgumentException("Cette demande n'appartient pas à votre société");
        }
        
        // Seules les demandes EN_ATTENTE ou VALIDEE peuvent être annulées
        if (demande.getStatut() != StatutDemande.EN_ATTENTE && 
            demande.getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException("Cette demande ne peut plus être annulée");
        }
        
        demande.setStatut(StatutDemande.ANNULEE);
        
        DemandeEnlevement savedDemande = demandeRepository.save(demande);
        
        log.info("Demande annulée : {}", savedDemande.getNumeroDemande());
        return toDTO(savedDemande);
    }
    
    /**
     * Change le statut en PLANIFIEE
     */
    public DemandeEnlevementDTO marquerCommePlanifiee(Long id) {
        DemandeEnlevement demande = demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande non trouvée"));
        
        demande.setStatut(StatutDemande.PLANIFIEE);
        DemandeEnlevement savedDemande = demandeRepository.save(demande);
        
        return toDTO(savedDemande);
    }
    
    private DemandeEnlevementDTO toDTO(DemandeEnlevement demande) {
        return DemandeEnlevementDTO.builder()
                .id(demande.getId())
                .numeroDemande(demande.getNumeroDemande())
                .dateSouhaitee(demande.getDateSouhaitee())
                .heureSouhaitee(demande.getHeureSouhaitee())
                .siteId(demande.getSite().getId())
                .siteNom(demande.getSite().getName())
                .societeId(demande.getSociete().getId())
                .societeNom(demande.getSociete().getRaisonSociale())
                .typeDechetEstime(demande.getTypeDechetEstime())
                .quantiteEstimee(demande.getQuantiteEstimee())
                .commentaire(demande.getCommentaire())
                .statut(demande.getStatut().name())
                .motifRefus(demande.getMotifRefus())
                .dateCreation(demande.getDateCreation())
                .dateTraitement(demande.getDateTraitement())
                .createdBy(demande.getCreatedBy())
                .treatedBy(demande.getTreatedBy())
                .build();
    }
}

