-- Migration V10 : Ajout des champs camion et chauffeur à la table enlevement
-- Permet d'associer un camion et un chauffeur à un enlèvement

-- Ajout de la colonne camion_id (nullable pour les enlèvements existants)
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS camion_id BIGINT;

-- Ajout de la colonne chauffeur_nom
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS chauffeur_nom VARCHAR(100);

-- Ajout de la clé étrangère vers camion
ALTER TABLE enlevement 
ADD CONSTRAINT fk_enlevement_camion 
FOREIGN KEY (camion_id) REFERENCES camion(id) ON DELETE SET NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_enlevement_camion ON enlevement(camion_id);

-- Commentaires
COMMENT ON COLUMN enlevement.camion_id IS 'Référence au camion utilisé pour cet enlèvement (doit être actif)';
COMMENT ON COLUMN enlevement.chauffeur_nom IS 'Nom du chauffeur affecté à cet enlèvement';

