package ma.iorecycling.mapper;

import ma.iorecycling.dto.CamionDTO;
import ma.iorecycling.dto.CreateCamionRequest;
import ma.iorecycling.dto.UpdateCamionRequest;
import ma.iorecycling.entity.Camion;
import ma.iorecycling.repository.SocieteProprietaireRepository;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Mapper pour l'entité Camion
 */
@Component
@RequiredArgsConstructor
public class CamionMapper {
    
    private final SocieteProprietaireRepository societeProprietaireRepository;
    
    public CamionDTO toDTO(Camion camion) {
        if (camion == null) {
            return null;
        }
        
        return CamionDTO.builder()
                .id(camion.getId())
                .matricule(camion.getMatricule())
                .tonnageMaxKg(camion.getTonnageMaxKg())
                .typeCamion(camion.getTypeCamion())
                .observation(camion.getObservation())
                .societeProprietaireId(camion.getSocieteProprietaire() != null ? camion.getSocieteProprietaire().getId() : null)
                .societeProprietaireNom(camion.getSocieteProprietaire() != null ? camion.getSocieteProprietaire().getRaisonSociale() : null)
                .actif(camion.getActif())
                .createdAt(camion.getCreatedAt())
                .updatedAt(camion.getUpdatedAt())
                .build();
    }
    
    public Camion toEntity(CreateCamionRequest request) {
        if (request == null) {
            return null;
        }
        
        return Camion.builder()
                .matricule(request.getMatricule())
                .tonnageMaxKg(request.getTonnageMaxKg())
                .typeCamion(request.getTypeCamion())
                .observation(request.getObservation())
                .societeProprietaire(societeProprietaireRepository.findById(request.getSocieteProprietaireId())
                        .orElseThrow(() -> new IllegalArgumentException("Société propriétaire non trouvée avec l'ID : " + request.getSocieteProprietaireId())))
                .actif(request.getActif() != null ? request.getActif() : true)
                .build();
    }
    
    public void updateEntity(Camion camion, UpdateCamionRequest request) {
        if (camion == null || request == null) {
            return;
        }
        
        camion.setTonnageMaxKg(request.getTonnageMaxKg());
        camion.setTypeCamion(request.getTypeCamion());
        camion.setObservation(request.getObservation());
        camion.setSocieteProprietaire(societeProprietaireRepository.findById(request.getSocieteProprietaireId())
                .orElseThrow(() -> new IllegalArgumentException("Société propriétaire non trouvée avec l'ID : " + request.getSocieteProprietaireId())));
        camion.setActif(request.getActif());
    }
}

