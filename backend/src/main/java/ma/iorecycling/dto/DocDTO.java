package ma.iorecycling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocDTO {
    
    private String name;
    private String type;
    private String url;
}
