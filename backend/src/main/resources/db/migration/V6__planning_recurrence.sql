-- Migration V6 : Planning et Récurrences

-- ============================================
-- TABLE RECURRENCE
-- ============================================
CREATE TABLE IF NOT EXISTS recurrence (
    id BIGSERIAL PRIMARY KEY,
    societe_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    type_recurrence VARCHAR(20) NOT NULL CHECK (type_recurrence IN ('HEBDOMADAIRE', 'BIMENSUELLE', 'MENSUELLE', 'PERSONNALISEE')),
    jour_semaine VARCHAR(20),
    jours_semaine_bimensuel VARCHAR(50),
    jour_mois INTEGER CHECK (jour_mois BETWEEN 1 AND 31),
    heure_prevue VARCHAR(50),
    date_debut DATE NOT NULL,
    date_fin DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE RESTRICT
);

CREATE INDEX idx_recurrence_societe ON recurrence(societe_id);
CREATE INDEX idx_recurrence_active ON recurrence(active);

-- ============================================
-- TABLE PLANNING_ENLEVEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS planning_enlevement (
    id BIGSERIAL PRIMARY KEY,
    date_prevue DATE NOT NULL,
    heure_prevue VARCHAR(50),
    site_id BIGINT NOT NULL,
    societe_id BIGINT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'PLANIFIE' CHECK (statut IN ('PLANIFIE', 'CONFIRME', 'REALISE', 'ANNULE')),
    commentaire TEXT,
    recurrence_id BIGINT,
    enlevement_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE RESTRICT,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE,
    FOREIGN KEY (recurrence_id) REFERENCES recurrence(id) ON DELETE SET NULL,
    FOREIGN KEY (enlevement_id) REFERENCES enlevement(id) ON DELETE SET NULL
);

CREATE INDEX idx_planning_date ON planning_enlevement(date_prevue);
CREATE INDEX idx_planning_societe ON planning_enlevement(societe_id);
CREATE INDEX idx_planning_site ON planning_enlevement(site_id);
CREATE INDEX idx_planning_statut ON planning_enlevement(statut);

COMMENT ON TABLE recurrence IS 'Récurrences d''enlèvements (hebdomadaire, bimensuelle, mensuelle)';
COMMENT ON TABLE planning_enlevement IS 'Enlèvements planifiés (pas encore réalisés)';
COMMENT ON COLUMN planning_enlevement.statut IS 'PLANIFIE, CONFIRME, REALISE, ANNULE';

-- ============================================
-- Données de démonstration
-- ============================================

-- Récurrence hebdomadaire pour YAZAKI (tous les mercredis)
INSERT INTO recurrence (societe_id, site_id, type_recurrence, jour_semaine, heure_prevue, date_debut, active) VALUES
(1, 1, 'HEBDOMADAIRE', 'MERCREDI', '09h00 - 11h00', '2024-12-01', true);

-- Récurrence bimensuelle pour MARJANE (lundi et jeudi)
INSERT INTO recurrence (societe_id, site_id, type_recurrence, jours_semaine_bimensuel, heure_prevue, date_debut, active) VALUES
(2, 3, 'BIMENSUELLE', 'LUNDI,JEUDI', '08h00 - 10h00', '2024-12-01', true);

-- Planning enlèvements à venir
INSERT INTO planning_enlevement (date_prevue, heure_prevue, site_id, societe_id, statut, recurrence_id) VALUES
('2024-12-04', '09h00 - 11h00', 1, 1, 'PLANIFIE', 1),
('2024-12-09', '08h00 - 10h00', 3, 2, 'PLANIFIE', 2),
('2024-12-11', '09h00 - 11h00', 1, 1, 'PLANIFIE', 1),
('2024-12-12', '08h00 - 10h00', 3, 2, 'PLANIFIE', 2);

