package ma.iorecycling.mapper;

import ma.iorecycling.dto.CreateDestinationRequest;
import ma.iorecycling.dto.DestinationDTO;
import ma.iorecycling.dto.UpdateDestinationRequest;
import ma.iorecycling.entity.Destination;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Mapper pour l'entité Destination
 */
@Component
public class DestinationMapper {
    
    public DestinationDTO toDTO(Destination destination) {
        if (destination == null) {
            return null;
        }
        
        return DestinationDTO.builder()
                .id(destination.getId())
                .raisonSociale(destination.getRaisonSociale())
                .site(destination.getSite())
                .typesTraitement(new ArrayList<>(destination.getTypesTraitement()))
                .nomInterlocuteur(destination.getNomInterlocuteur())
                .telInterlocuteur(destination.getTelInterlocuteur())
                .posteInterlocuteur(destination.getPosteInterlocuteur())
                .emailInterlocuteur(destination.getEmailInterlocuteur())
                .adresse(destination.getAdresse())
                .observation(destination.getObservation())
                .createdAt(destination.getCreatedAt())
                .updatedAt(destination.getUpdatedAt())
                .build();
    }
    
    public Destination toEntity(CreateDestinationRequest request) {
        if (request == null) {
            return null;
        }
        
        return Destination.builder()
                .raisonSociale(request.getRaisonSociale())
                .site(request.getSite())
                .typesTraitement(new ArrayList<>(request.getTypesTraitement()))
                .nomInterlocuteur(request.getNomInterlocuteur())
                .telInterlocuteur(request.getTelInterlocuteur())
                .posteInterlocuteur(request.getPosteInterlocuteur())
                .emailInterlocuteur(request.getEmailInterlocuteur())
                .adresse(request.getAdresse())
                .observation(request.getObservation())
                .build();
    }
    
    public void updateEntity(Destination destination, UpdateDestinationRequest request) {
        if (destination == null || request == null) {
            return;
        }
        
        destination.setRaisonSociale(request.getRaisonSociale());
        destination.setSite(request.getSite());
        destination.setTypesTraitement(new ArrayList<>(request.getTypesTraitement()));
        destination.setNomInterlocuteur(request.getNomInterlocuteur());
        destination.setTelInterlocuteur(request.getTelInterlocuteur());
        destination.setPosteInterlocuteur(request.getPosteInterlocuteur());
        destination.setEmailInterlocuteur(request.getEmailInterlocuteur());
        destination.setAdresse(request.getAdresse());
        destination.setObservation(request.getObservation());
    }
}

