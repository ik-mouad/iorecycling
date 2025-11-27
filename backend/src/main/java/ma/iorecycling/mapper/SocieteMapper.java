package ma.iorecycling.mapper;

import ma.iorecycling.dto.CreateSocieteRequest;
import ma.iorecycling.dto.SocieteDTO;
import ma.iorecycling.dto.UpdateSocieteRequest;
import ma.iorecycling.entity.Societe;
import org.springframework.stereotype.Component;

/**
 * Mapper pour l'entité Societe
 */
@Component
public class SocieteMapper {
    
    public SocieteDTO toDTO(Societe societe) {
        if (societe == null) {
            return null;
        }
        
        return SocieteDTO.builder()
                .id(societe.getId())
                .raisonSociale(societe.getRaisonSociale())
                .ice(societe.getIce())
                .email(societe.getEmail())
                .telephone(societe.getTelephone())
                .commentaire(societe.getCommentaire())
                .createdAt(societe.getCreatedAt())
                .updatedAt(societe.getUpdatedAt())
                .nbSites(societe.getSites() != null ? societe.getSites().size() : 0)
                .nbUtilisateurs(societe.getUsers() != null ? societe.getUsers().size() : 0)
                .nbEnlevements(societe.getEnlevements() != null ? societe.getEnlevements().size() : 0)
                .build();
    }
    
    public Societe toEntity(CreateSocieteRequest request) {
        if (request == null) {
            return null;
        }
        
        return Societe.builder()
                .raisonSociale(request.getRaisonSociale())
                .ice(request.getIce())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .commentaire(request.getCommentaire())
                .build();
    }
    
    public void updateEntity(Societe societe, UpdateSocieteRequest request) {
        if (societe == null || request == null) {
            return;
        }
        
        societe.setRaisonSociale(request.getRaisonSociale());
        societe.setEmail(request.getEmail());
        societe.setTelephone(request.getTelephone());
        societe.setCommentaire(request.getCommentaire());
    }
}

