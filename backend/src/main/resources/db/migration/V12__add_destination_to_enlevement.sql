-- Migration V12 : Ajout du champ destination à la table enlevement
-- Permet d'associer une destination principale à un enlèvement

-- Ajout de la colonne destination_id (nullable pour les enlèvements existants)
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS destination_id BIGINT;

-- Ajout de la clé étrangère vers destination
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_enlevement_destination' AND table_name = 'enlevement'
    ) THEN
        ALTER TABLE enlevement 
        ADD CONSTRAINT fk_enlevement_destination 
        FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_enlevement_destination ON enlevement(destination_id);

-- Commentaires
COMMENT ON COLUMN enlevement.destination_id IS 'Référence à la destination principale pour cet enlèvement (obligatoire si items A_ELIMINER présents)';

