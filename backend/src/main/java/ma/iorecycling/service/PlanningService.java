package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.PlanningEnlevementDTO;
import ma.iorecycling.entity.PlanningEnlevement;
import ma.iorecycling.entity.PlanningEnlevement.StatutPlanning;
import ma.iorecycling.entity.Site;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.PlanningEnlevementRepository;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion du planning des enlèvements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PlanningService {
    
    private final PlanningEnlevementRepository planningRepository;
    private final SocieteRepository societeRepository;
    private final SiteRepository siteRepository;
    
    /**
     * Crée un enlèvement planifié manuel
     */
    public PlanningEnlevementDTO createPlanningManuel(
            LocalDate datePrevue,
            String heurePrevue,
            Long siteId,
            Long societeId,
            String commentaire) {
        
        log.info("Création planning manuel pour société {} le {}", societeId, datePrevue);
        
        Societe societe = societeRepository.findById(societeId)
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
        
        PlanningEnlevement planning = PlanningEnlevement.builder()
                .datePrevue(datePrevue)
                .heurePrevue(heurePrevue)
                .site(site)
                .societe(societe)
                .statut(StatutPlanning.PLANIFIE)
                .commentaire(commentaire)
                .build();
        
        PlanningEnlevement saved = planningRepository.save(planning);
        
        log.info("Planning créé : ID {}", saved.getId());
        return toDTO(saved);
    }
    
    /**
     * Récupère le planning d'un mois
     */
    @Transactional(readOnly = true)
    public List<PlanningEnlevementDTO> getPlanningDuMois(YearMonth mois) {
        LocalDate debut = mois.atDay(1);
        LocalDate fin = mois.atEndOfMonth();
        
        return planningRepository.findByMois(debut, fin).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les enlèvements planifiés d'un jour
     */
    @Transactional(readOnly = true)
    public List<PlanningEnlevementDTO> getPlanningDuJour(LocalDate date) {
        return planningRepository.findByDatePrevueOrderByHeurePrevueAsc(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Modifie la date/heure d'un planning
     */
    public PlanningEnlevementDTO modifierPlanning(
            Long id,
            LocalDate nouvelleDatePrevue,
            String nouvelleHeurePrevue) {
        
        log.info("Modification planning ID {}", id);
        
        PlanningEnlevement planning = planningRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planning non trouvé"));
        
        planning.setDatePrevue(nouvelleDatePrevue);
        planning.setHeurePrevue(nouvelleHeurePrevue);
        
        PlanningEnlevement saved = planningRepository.save(planning);
        
        log.info("Planning modifié : ID {}", id);
        return toDTO(saved);
    }
    
    /**
     * Annule un enlèvement planifié
     */
    public PlanningEnlevementDTO annulerPlanning(Long id) {
        log.info("Annulation planning ID {}", id);
        
        PlanningEnlevement planning = planningRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Planning non trouvé"));
        
        planning.setStatut(StatutPlanning.ANNULE);
        
        PlanningEnlevement saved = planningRepository.save(planning);
        
        log.info("Planning annulé : ID {}", id);
        return toDTO(saved);
    }
    
    /**
     * Supprime un enlèvement planifié
     */
    public void supprimerPlanning(Long id) {
        log.info("Suppression planning ID {}", id);
        
        if (!planningRepository.existsById(id)) {
            throw new IllegalArgumentException("Planning non trouvé");
        }
        
        planningRepository.deleteById(id);
        log.info("Planning supprimé : ID {}", id);
    }
    
    private PlanningEnlevementDTO toDTO(PlanningEnlevement planning) {
        return PlanningEnlevementDTO.builder()
                .id(planning.getId())
                .datePrevue(planning.getDatePrevue())
                .heurePrevue(planning.getHeurePrevue())
                .siteId(planning.getSite().getId())
                .siteNom(planning.getSite().getName())
                .societeId(planning.getSociete().getId())
                .societeNom(planning.getSociete().getRaisonSociale())
                .statut(planning.getStatut().name())
                .commentaire(planning.getCommentaire())
                .recurrenceId(planning.getRecurrence() != null ? planning.getRecurrence().getId() : null)
                .enlevementId(planning.getEnlevement() != null ? planning.getEnlevement().getId() : null)
                .enlevementNumero(planning.getEnlevement() != null ? planning.getEnlevement().getNumeroEnlevement() : null)
                .createdAt(planning.getCreatedAt())
                .updatedAt(planning.getUpdatedAt())
                .build();
    }
}

