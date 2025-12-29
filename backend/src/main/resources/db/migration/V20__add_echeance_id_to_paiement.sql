-- Migration pour ajouter le lien entre paiement et échéance
-- Permet de tracer quel paiement correspond à quelle échéance

ALTER TABLE paiement 
ADD COLUMN IF NOT EXISTS echeance_id BIGINT;

-- Créer la clé étrangère
ALTER TABLE paiement
ADD CONSTRAINT fk_paiement_echeance 
FOREIGN KEY (echeance_id) REFERENCES echeance(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_paiement_echeance ON paiement(echeance_id);

