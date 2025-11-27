-- Migration V5 : Demandes d'enlèvements et Planning

-- ============================================
-- TABLE DEMANDE_ENLEVEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS demande_enlevement (
    id BIGSERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE,
    date_souhaitee DATE NOT NULL,
    heure_souhaitee VARCHAR(50),
    site_id BIGINT NOT NULL,
    societe_id BIGINT NOT NULL,
    type_dechet_estime VARCHAR(100),
    quantite_estimee DECIMAL(10, 2),
    commentaire TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'VALIDEE', 'PLANIFIEE', 'REALISEE', 'REFUSEE', 'ANNULEE')),
    motif_refus TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP,
    created_by VARCHAR(100),
    treated_by VARCHAR(100),
    FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE RESTRICT,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE
);

CREATE INDEX idx_demande_societe ON demande_enlevement(societe_id);
CREATE INDEX idx_demande_statut ON demande_enlevement(statut);
CREATE INDEX idx_demande_date_souhaitee ON demande_enlevement(date_souhaitee);

COMMENT ON TABLE demande_enlevement IS 'Demandes d''enlèvements ponctuels des clients';
COMMENT ON COLUMN demande_enlevement.statut IS 'EN_ATTENTE, VALIDEE, PLANIFIEE, REALISEE, REFUSEE, ANNULEE';

-- ============================================
-- Données de démonstration
-- ============================================
INSERT INTO demande_enlevement (numero_demande, date_souhaitee, heure_souhaitee, site_id, societe_id, type_dechet_estime, quantite_estimee, commentaire, statut, created_by) VALUES
('DEM-2024-000001', '2024-12-05', '09h00 - 11h00', 1, 1, 'Déchets valorisables', 300.0, 'Besoin d''un enlèvement supplémentaire', 'EN_ATTENTE', 's.bennani@yazaki.ma'),
('DEM-2024-000002', '2024-12-08', '14h00 - 16h00', 3, 2, 'Carton principalement', 150.0, 'Collecte exceptionnelle', 'VALIDEE', 'k.alami@marjane.ma');

