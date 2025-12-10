package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les documents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocDTO {
    
    private Long id;
    private String name;
    private String type;
    private String url;
    private String description;
    private Long fileSize;
    private String mimeType;
    
    /**
     * Crée un DocDTO à partir d'un Document
     */
    public static DocDTO fromDocument(ma.iorecycling.entity.Document document, String downloadUrl) {
        return DocDTO.builder()
                .id(document.getId())
                .name(document.getFileName())
                .type(document.getTypeDocument().name())
                .url(downloadUrl)
                .description(document.getTypeDocument().getDescription())
                .fileSize(document.getSize())
                .mimeType(document.getMimeType())
                .build();
    }
}