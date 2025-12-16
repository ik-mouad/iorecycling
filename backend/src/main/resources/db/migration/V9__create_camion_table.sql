-- Migration V9 : Création de la table camion pour la gestion de la flotte
-- Permet de gérer les camions appartenant à IORecycling ou aux sociétés partenaires

-- ============================================
-- TABLE CAMION
-- ============================================
CREATE TABLE IF NOT EXISTS camion (
    id BIGSERIAL PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    tonnage_max_kg DECIMAL(10, 2) NOT NULL CHECK (tonnage_max_kg > 0),
    type_camion VARCHAR(20) NOT NULL,
    observation TEXT,
    societe_proprietaire_id BIGINT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_proprietaire_id) REFERENCES societe(id) ON DELETE RESTRICT
);

-- Index pour améliorer les performances
CREATE INDEX idx_camion_matricule ON camion(matricule);
CREATE INDEX idx_camion_societe_proprietaire ON camion(societe_proprietaire_id);
CREATE INDEX idx_camion_actif ON camion(actif);
CREATE INDEX idx_camion_type ON camion(type_camion);

-- Contrainte pour vérifier que le type_camion est valide
ALTER TABLE camion ADD CONSTRAINT chk_type_camion 
    CHECK (type_camion IN ('PLATEAU', 'CAISSON', 'AMPLIROLL', 'GRUE', 'HYDROCUREUR'));

-- Commentaires
COMMENT ON TABLE camion IS 'Table des camions de la flotte (IORecycling et partenaires)';
COMMENT ON COLUMN camion.matricule IS 'Matricule unique du camion';
COMMENT ON COLUMN camion.tonnage_max_kg IS 'Tonnage maximum en kilogrammes';
COMMENT ON COLUMN camion.type_camion IS 'Type de camion : PLATEAU, CAISSON, AMPLIROLL, GRUE, HYDROCUREUR';
COMMENT ON COLUMN camion.societe_proprietaire_id IS 'Référence à la société propriétaire du camion';
COMMENT ON COLUMN camion.actif IS 'Indique si le camion est actif et peut être utilisé pour les enlèvements';

