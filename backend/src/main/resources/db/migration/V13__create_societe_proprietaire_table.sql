-- Migration V13 : Création de la table societe_proprietaire
-- Sépare les sociétés propriétaires de camions des sociétés clientes

-- ============================================
-- TABLE SOCIETE_PROPRIETAIRE
-- ============================================
CREATE TABLE IF NOT EXISTS societe_proprietaire (
    id BIGSERIAL PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse VARCHAR(500),
    observation TEXT,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_societe_proprietaire_raison_sociale ON societe_proprietaire(raison_sociale);
CREATE INDEX idx_societe_proprietaire_actif ON societe_proprietaire(actif);

-- Commentaires
COMMENT ON TABLE societe_proprietaire IS 'Table des sociétés propriétaires de camions (partenaires, sous-traitants, etc.) - Sépare des sociétés clientes';
COMMENT ON COLUMN societe_proprietaire.raison_sociale IS 'Raison sociale de la société propriétaire';
COMMENT ON COLUMN societe_proprietaire.actif IS 'Indique si la société propriétaire est active';

-- ============================================
-- MODIFICATION DE LA TABLE CAMION
-- ============================================
-- Supprimer l'ancienne clé étrangère vers societe si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'camion_societe_proprietaire_id_fkey'
    ) THEN
        ALTER TABLE camion DROP CONSTRAINT camion_societe_proprietaire_id_fkey;
    END IF;
END $$;

-- La colonne societe_proprietaire_id existe déjà, on change juste la référence
-- Ajouter la nouvelle clé étrangère vers societe_proprietaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_camion_societe_proprietaire'
    ) THEN
        ALTER TABLE camion 
        ADD CONSTRAINT fk_camion_societe_proprietaire 
        FOREIGN KEY (societe_proprietaire_id) REFERENCES societe_proprietaire(id) ON DELETE RESTRICT;
    END IF;
END $$;

