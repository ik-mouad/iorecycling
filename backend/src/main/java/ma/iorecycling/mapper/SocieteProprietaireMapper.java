package ma.iorecycling.mapper;

import ma.iorecycling.dto.CreateSocieteProprietaireRequest;
import ma.iorecycling.dto.SocieteProprietaireDTO;
import ma.iorecycling.dto.UpdateSocieteProprietaireRequest;
import ma.iorecycling.entity.SocieteProprietaire;
import org.springframework.stereotype.Component;

/**
 * Mapper pour l'entité SocieteProprietaire
 */
@Component
public class SocieteProprietaireMapper {
    
    public SocieteProprietaireDTO toDTO(SocieteProprietaire societe) {
        if (societe == null) {
            return null;
        }
        
        return SocieteProprietaireDTO.builder()
                .id(societe.getId())
                .raisonSociale(societe.getRaisonSociale())
                .contact(societe.getContact())
                .telephone(societe.getTelephone())
                .email(societe.getEmail())
                .adresse(societe.getAdresse())
                .observation(societe.getObservation())
                .actif(societe.getActif())
                .createdAt(societe.getCreatedAt())
                .updatedAt(societe.getUpdatedAt())
                .build();
    }
    
    public SocieteProprietaire toEntity(CreateSocieteProprietaireRequest request) {
        if (request == null) {
            return null;
        }
        
        return SocieteProprietaire.builder()
                .raisonSociale(request.getRaisonSociale())
                .contact(request.getContact())
                .telephone(request.getTelephone())
                .email(request.getEmail())
                .adresse(request.getAdresse())
                .observation(request.getObservation())
                .actif(request.getActif() != null ? request.getActif() : true)
                .build();
    }
    
    public void updateEntity(SocieteProprietaire societe, UpdateSocieteProprietaireRequest request) {
        if (societe == null || request == null) {
            return;
        }
        
        societe.setRaisonSociale(request.getRaisonSociale());
        societe.setContact(request.getContact());
        societe.setTelephone(request.getTelephone());
        societe.setEmail(request.getEmail());
        societe.setAdresse(request.getAdresse());
        societe.setObservation(request.getObservation());
        societe.setActif(request.getActif());
    }
}

