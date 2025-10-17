package ma.iorecycling.entity;

/**
 * Type d'enlèvement de déchets
 */
public enum PickupType {
    ALL("Tous"),
    RECYCLABLE("Recyclable"),
    BANAL("Banal"),
    DANGEREUX("Dangereux");
    
    private final String displayName;
    
    PickupType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
