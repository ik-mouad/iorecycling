package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupRowDTO {
    
    private Instant date;
    private String type;
    private Double tonnageKg;
    private String site;
    private List<DocDTO> documents;
    
    public PickupRowDTO(Instant date, String type, Double tonnageKg, String site) {
        this.date = date;
        this.type = type;
        this.tonnageKg = tonnageKg;
        this.site = site;
    }
}
