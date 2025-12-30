-- Migration V11 : Création de la table destination pour la gestion des centres de tri/traitement
-- Permet de gérer les destinations où les déchets sont envoyés

-- ============================================
-- TABLE DESTINATION
-- ============================================
CREATE TABLE IF NOT EXISTS destination (
    id BIGSERIAL PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL,
    site VARCHAR(255) NOT NULL,
    nom_interlocuteur VARCHAR(100),
    tel_interlocuteur VARCHAR(20),
    poste_interlocuteur VARCHAR(100),
    email_interlocuteur VARCHAR(255),
    adresse VARCHAR(500),
    observation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE DESTINATION_TYPES_TRAITEMENT (table de jointure)
-- ============================================
CREATE TABLE IF NOT EXISTS destination_types_traitement (
    destination_id BIGINT NOT NULL,
    type_traitement VARCHAR(50) NOT NULL,
    PRIMARY KEY (destination_id, type_traitement),
    FOREIGN KEY (destination_id) REFERENCES destination(id) ON DELETE CASCADE,
    CONSTRAINT chk_type_traitement CHECK (type_traitement IN (
        'RECYCLAGE', 'REUTILISATION', 'ENFOUISSEMENT', 'INCINERATION',
        'VALORISATION_ENERGETIQUE', 'DENATURATION_DESTRUCTION', 'TRAITEMENT'
    ))
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_destination_raison_sociale ON destination(raison_sociale);
CREATE INDEX IF NOT EXISTS idx_destination_site ON destination(site);
CREATE INDEX IF NOT EXISTS idx_destination_types_traitement ON destination_types_traitement(destination_id);

-- Commentaires
COMMENT ON TABLE destination IS 'Table des destinations (centres de tri/traitement)';
COMMENT ON COLUMN destination.raison_sociale IS 'Raison sociale du centre';
COMMENT ON COLUMN destination.site IS 'Site du centre';
COMMENT ON TABLE destination_types_traitement IS 'Table de jointure pour les types de traitement des destinations';
COMMENT ON COLUMN destination_types_traitement.type_traitement IS 'Type de traitement proposé par la destination';

