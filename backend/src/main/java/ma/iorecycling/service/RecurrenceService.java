package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.iorecycling.dto.CreateRecurrenceRequest;
import ma.iorecycling.dto.RecurrenceDTO;
import ma.iorecycling.entity.PlanningEnlevement;
import ma.iorecycling.entity.Recurrence;
import ma.iorecycling.entity.Recurrence.TypeRecurrence;
import ma.iorecycling.entity.Site;
import ma.iorecycling.entity.Societe;
import ma.iorecycling.repository.PlanningEnlevementRepository;
import ma.iorecycling.repository.RecurrenceRepository;
import ma.iorecycling.repository.SiteRepository;
import ma.iorecycling.repository.SocieteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des récurrences
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RecurrenceService {
    
    private final RecurrenceRepository recurrenceRepository;
    private final SocieteRepository societeRepository;
    private final SiteRepository siteRepository;
    private final PlanningEnlevementRepository planningEnlevementRepository;
    
    /**
     * Crée une nouvelle récurrence
     */
    public RecurrenceDTO createRecurrence(CreateRecurrenceRequest request) {
        log.info("Création récurrence {} pour société {}", request.getTypeRecurrence(), request.getSocieteId());
        
        Societe societe = societeRepository.findById(request.getSocieteId())
                .orElseThrow(() -> new IllegalArgumentException("Société non trouvée"));
        
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new IllegalArgumentException("Site non trouvé"));
        
        TypeRecurrence typeRecurrence = TypeRecurrence.valueOf(request.getTypeRecurrence().toUpperCase());
        
        Recurrence recurrence = Recurrence.builder()
                .societe(societe)
                .site(site)
                .typeRecurrence(typeRecurrence)
                .jourSemaine(request.getJourSemaine())
                .joursSemaneBimensuel(request.getJoursSemaneBimensuel())
                .jourMois(request.getJourMois())
                .heurePrevue(request.getHeurePrevue())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .active(true)
                .build();
        
        Recurrence saved = recurrenceRepository.save(recurrence);
        
        // Générer automatiquement les planning_enlevement pour les 3 prochains mois
        generatePlanningEnlevements(saved);
        
        log.info("Récurrence créée : ID {} avec planning généré", saved.getId());
        return toDTO(saved);
    }
    
    /**
     * Récupère toutes les récurrences actives
     */
    @Transactional(readOnly = true)
    public List<RecurrenceDTO> getRecurrencesActives() {
        return recurrenceRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les récurrences d'une société
     */
    @Transactional(readOnly = true)
    public List<RecurrenceDTO> getRecurrencesBySociete(Long societeId) {
        return recurrenceRepository.findBySocieteId(societeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Désactive une récurrence
     */
    public RecurrenceDTO desactiverRecurrence(Long id) {
        log.info("Désactivation récurrence ID {}", id);
        
        Recurrence recurrence = recurrenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Récurrence non trouvée"));
        
        recurrence.setActive(false);
        
        Recurrence saved = recurrenceRepository.save(recurrence);
        
        log.info("Récurrence désactivée : ID {}", id);
        return toDTO(saved);
    }
    
    /**
     * Supprime une récurrence
     */
    public void supprimerRecurrence(Long id) {
        log.info("Suppression récurrence ID {}", id);
        
        if (!recurrenceRepository.existsById(id)) {
            throw new IllegalArgumentException("Récurrence non trouvée");
        }
        
        recurrenceRepository.deleteById(id);
        log.info("Récurrence supprimée : ID {}", id);
    }
    
    /**
     * Génère automatiquement les planning_enlevement pour les 3 prochains mois
     */
    private void generatePlanningEnlevements(Recurrence recurrence) {
        LocalDate startDate = recurrence.getDateDebut();
        LocalDate endDate = startDate.plusMonths(3);
        
        // Respecter dateFin si elle est définie et avant les 3 mois
        if (recurrence.getDateFin() != null && recurrence.getDateFin().isBefore(endDate)) {
            endDate = recurrence.getDateFin();
        }
        
        List<LocalDate> dates = calculateDates(recurrence, startDate, endDate);
        
        log.info("Génération de {} planning_enlevement pour récurrence ID {}", dates.size(), recurrence.getId());
        
        for (LocalDate date : dates) {
            PlanningEnlevement planning = PlanningEnlevement.builder()
                    .datePrevue(date)
                    .heurePrevue(recurrence.getHeurePrevue())
                    .site(recurrence.getSite())
                    .societe(recurrence.getSociete())
                    .statut(PlanningEnlevement.StatutPlanning.PLANIFIE)
                    .recurrence(recurrence)
                    .build();
            
            planningEnlevementRepository.save(planning);
        }
        
        log.info("{} planning_enlevement générés avec succès", dates.size());
    }
    
    /**
     * Calcule les dates selon le type de récurrence
     */
    private List<LocalDate> calculateDates(Recurrence recurrence, LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        switch (recurrence.getTypeRecurrence()) {
            case HEBDOMADAIRE:
                dates.addAll(calculateWeeklyDates(recurrence, currentDate, endDate));
                break;
            case BIMENSUELLE:
                dates.addAll(calculateBiweeklyDates(recurrence, currentDate, endDate));
                break;
            case MENSUELLE:
                dates.addAll(calculateMonthlyDates(recurrence, currentDate, endDate));
                break;
            case PERSONNALISEE:
                // Pour personnalisée, on génère selon dateDebut uniquement
                if (currentDate.isBefore(endDate) || currentDate.isEqual(endDate)) {
                    dates.add(currentDate);
                }
                break;
        }
        
        return dates;
    }
    
    /**
     * Convertit un nom de jour français vers DayOfWeek
     */
    private DayOfWeek mapJourSemaineToDayOfWeek(String jourSemaine) {
        if (jourSemaine == null || jourSemaine.isEmpty()) {
            throw new IllegalArgumentException("Jour de la semaine non spécifié");
        }
        
        String jourUpper = jourSemaine.trim().toUpperCase();
        
        return switch (jourUpper) {
            case "LUNDI" -> DayOfWeek.MONDAY;
            case "MARDI" -> DayOfWeek.TUESDAY;
            case "MERCREDI" -> DayOfWeek.WEDNESDAY;
            case "JEUDI" -> DayOfWeek.THURSDAY;
            case "VENDREDI" -> DayOfWeek.FRIDAY;
            case "SAMEDI" -> DayOfWeek.SATURDAY;
            case "DIMANCHE" -> DayOfWeek.SUNDAY;
            default -> {
                // Essayer directement avec le nom anglais (pour compatibilité)
                try {
                    yield DayOfWeek.valueOf(jourUpper);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Jour de la semaine invalide: " + jourSemaine);
                }
            }
        };
    }
    
    /**
     * Calcule les dates pour une récurrence hebdomadaire
     */
    private List<LocalDate> calculateWeeklyDates(Recurrence recurrence, LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        
        if (recurrence.getJourSemaine() == null || recurrence.getJourSemaine().isEmpty()) {
            return dates;
        }
        
        DayOfWeek targetDay = mapJourSemaineToDayOfWeek(recurrence.getJourSemaine());
        
        // Trouver le premier jour de la semaine cible à partir de startDate (ou le même jour si c'est déjà le bon jour)
        LocalDate currentDate = startDate.with(TemporalAdjusters.nextOrSame(targetDay));
        
        // Si la date trouvée est après endDate, ne rien générer
        if (currentDate.isAfter(endDate)) {
            return dates;
        }
        
        // Générer toutes les dates hebdomadaires
        while (!currentDate.isAfter(endDate)) {
            dates.add(currentDate);
            currentDate = currentDate.plusWeeks(1);
        }
        
        return dates;
    }
    
    /**
     * Calcule les dates pour une récurrence bimensuelle (2x par semaine)
     */
    private List<LocalDate> calculateBiweeklyDates(Recurrence recurrence, LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        
        if (recurrence.getJoursSemaneBimensuel() == null || recurrence.getJoursSemaneBimensuel().isEmpty()) {
            return dates;
        }
        
        // Parser les jours (ex: "LUNDI,JEUDI")
        String[] joursStr = recurrence.getJoursSemaneBimensuel().split(",");
        List<DayOfWeek> targetDays = Arrays.stream(joursStr)
                .map(this::mapJourSemaineToDayOfWeek)
                .collect(Collectors.toList());
        
        // Pour chaque jour cible, générer les dates
        for (DayOfWeek targetDay : targetDays) {
            // Trouver le premier jour cible à partir de startDate
            LocalDate currentDate = startDate.with(TemporalAdjusters.nextOrSame(targetDay));
            
            // Générer toutes les dates pour ce jour de la semaine
            while (!currentDate.isAfter(endDate)) {
                dates.add(currentDate);
                currentDate = currentDate.plusWeeks(1);
            }
        }
        
        // Trier et dédupliquer
        return dates.stream().distinct().sorted().collect(Collectors.toList());
    }
    
    /**
     * Calcule les dates pour une récurrence mensuelle
     */
    private List<LocalDate> calculateMonthlyDates(Recurrence recurrence, LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        
        if (recurrence.getJourMois() == null) {
            return dates;
        }
        
        int targetDay = recurrence.getJourMois();
        LocalDate currentDate = startDate;
        
        // Trouver le premier mois avec le jour cible
        while (currentDate.isBefore(endDate) || currentDate.isEqual(endDate)) {
            LocalDate dateForMonth;
            
            try {
                // Essayer de créer la date avec le jour cible
                dateForMonth = LocalDate.of(currentDate.getYear(), currentDate.getMonth(), targetDay);
                
                // Si la date est avant startDate, passer au mois suivant
                if (dateForMonth.isBefore(startDate)) {
                    currentDate = currentDate.plusMonths(1).withDayOfMonth(1);
                    continue;
                }
                
                dates.add(dateForMonth);
            } catch (Exception e) {
                // Si le jour n'existe pas dans le mois (ex: 31 février), utiliser le dernier jour du mois
                int lastDayOfMonth = currentDate.lengthOfMonth();
                int dayToUse = Math.min(targetDay, lastDayOfMonth);
                dateForMonth = LocalDate.of(currentDate.getYear(), currentDate.getMonth(), dayToUse);
                
                if ((dateForMonth.isAfter(startDate) || dateForMonth.isEqual(startDate)) 
                    && (dateForMonth.isBefore(endDate) || dateForMonth.isEqual(endDate))) {
                    dates.add(dateForMonth);
                }
            }
            
            currentDate = currentDate.plusMonths(1).withDayOfMonth(1);
        }
        
        return dates;
    }
    
    private RecurrenceDTO toDTO(Recurrence recurrence) {
        return RecurrenceDTO.builder()
                .id(recurrence.getId())
                .societeId(recurrence.getSociete().getId())
                .societeNom(recurrence.getSociete().getRaisonSociale())
                .siteId(recurrence.getSite().getId())
                .siteNom(recurrence.getSite().getName())
                .typeRecurrence(recurrence.getTypeRecurrence().name())
                .jourSemaine(recurrence.getJourSemaine())
                .joursSemaneBimensuel(recurrence.getJoursSemaneBimensuel())
                .jourMois(recurrence.getJourMois())
                .heurePrevue(recurrence.getHeurePrevue())
                .dateDebut(recurrence.getDateDebut())
                .dateFin(recurrence.getDateFin())
                .active(recurrence.getActive())
                .createdAt(recurrence.getCreatedAt())
                .updatedAt(recurrence.getUpdatedAt())
                .build();
    }
}

