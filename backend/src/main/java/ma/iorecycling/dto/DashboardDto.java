package ma.iorecycling.dto;

public class DashboardDto {
    
    private Long pickupsCount;
    private KgSummary kg;
    
    public DashboardDto() {}
    
    public DashboardDto(Long pickupsCount, KgSummary kg) {
        this.pickupsCount = pickupsCount;
        this.kg = kg;
    }
    
    // Getters et Setters
    public Long getPickupsCount() {
        return pickupsCount;
    }
    
    public void setPickupsCount(Long pickupsCount) {
        this.pickupsCount = pickupsCount;
    }
    
    public KgSummary getKg() {
        return kg;
    }
    
    public void setKg(KgSummary kg) {
        this.kg = kg;
    }
    
    public static class KgSummary {
        private Double valorisables;
        private Double banals;
        private Double dangereux;
        
        public KgSummary() {}
        
        public KgSummary(Double valorisables, Double banals, Double dangereux) {
            this.valorisables = valorisables;
            this.banals = banals;
            this.dangereux = dangereux;
        }
        
        // Getters et Setters
        public Double getValorisables() {
            return valorisables;
        }
        
        public void setValorisables(Double valorisables) {
            this.valorisables = valorisables;
        }
        
        public Double getBanals() {
            return banals;
        }
        
        public void setBanals(Double banals) {
            this.banals = banals;
        }
        
        public Double getDangereux() {
            return dangereux;
        }
        
        public void setDangereux(Double dangereux) {
            this.dangereux = dangereux;
        }
    }
}
