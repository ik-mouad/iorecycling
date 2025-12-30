-- Migration V4 : Nouveau modèle de données IORecycling
-- Societe, ClientUser, Site, Enlevement, PickupItem, Document

-- Nettoyage de l'ancien modèle (tables héritées de V1-V3)
DROP TABLE IF EXISTS document CASCADE;
DROP TABLE IF EXISTS pickup_item CASCADE;
DROP TABLE IF EXISTS pickup_items CASCADE;
DROP TABLE IF EXISTS pickups CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS site CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TYPE IF EXISTS pickup_type;

-- ============================================
-- 1. TABLE SOCIETE (Entreprise cliente)
-- ============================================
CREATE TABLE IF NOT EXISTS societe (
    id BIGSERIAL PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL,
    ice VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_societe_ice ON societe(ice);

-- ============================================
-- 2. TABLE CLIENT_USER (Utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS client_user (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    poste_occupe VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    societe_id BIGINT NOT NULL,
    keycloak_user_id VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_client_user_email ON client_user(email);
CREATE INDEX IF NOT EXISTS idx_client_user_societe ON client_user(societe_id);

-- ============================================
-- 3. TABLE SITE (Lieu de collecte)
-- ============================================
CREATE TABLE IF NOT EXISTS site (
    id BIGSERIAL PRIMARY KEY,
    societe_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    adresse TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_site_societe ON site(societe_id);

-- ============================================
-- 4. TABLE ENLEVEMENT (Collecte)
-- ============================================
CREATE TABLE IF NOT EXISTS enlevement (
    id BIGSERIAL PRIMARY KEY,
    numero_enlevement VARCHAR(50) UNIQUE,
    date_enlevement DATE NOT NULL,
    site_id BIGINT NOT NULL,
    societe_id BIGINT NOT NULL,
    observation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE RESTRICT,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enlevement_date ON enlevement(date_enlevement);
CREATE INDEX IF NOT EXISTS idx_enlevement_site ON enlevement(site_id);
CREATE INDEX IF NOT EXISTS idx_enlevement_societe ON enlevement(societe_id);
CREATE INDEX IF NOT EXISTS idx_enlevement_numero ON enlevement(numero_enlevement);

-- ============================================
-- 5. TABLE PICKUP_ITEM (Ligne de détail)
-- ============================================
CREATE TABLE IF NOT EXISTS pickup_item (
    id BIGSERIAL PRIMARY KEY,
    enlevement_id BIGINT NOT NULL,
    type_dechet VARCHAR(20) NOT NULL CHECK (type_dechet IN ('VALORISABLE', 'BANAL', 'A_ELIMINER')),
    sous_type VARCHAR(50),
    quantite_kg DECIMAL(10, 3) NOT NULL CHECK (quantite_kg >= 0),
    prix_unitaire_mad DECIMAL(10, 3) NOT NULL CHECK (prix_unitaire_mad >= 0),
    montant_mad DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enlevement_id) REFERENCES enlevement(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pickup_item_enlevement ON pickup_item(enlevement_id);
CREATE INDEX IF NOT EXISTS idx_pickup_item_type ON pickup_item(type_dechet);

-- ============================================
-- 6. TABLE DOCUMENT (Fichiers)
-- ============================================
CREATE TABLE IF NOT EXISTS document (
    id BIGSERIAL PRIMARY KEY,
    type_document VARCHAR(50) NOT NULL CHECK (type_document IN ('BSDI', 'PV_DESTRUCTION', 'ATTESTATION_VALORISATION', 'ATTESTATION_ELIMINATION', 'FACTURE')),
    enlevement_id BIGINT,
    societe_id BIGINT NOT NULL,
    periode_mois VARCHAR(7) CHECK (periode_mois ~ '^\d{4}-\d{2}$'),
    file_name VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100),
    size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    FOREIGN KEY (enlevement_id) REFERENCES enlevement(id) ON DELETE CASCADE,
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE,
    -- Constraint : Documents d'enlèvement OU mensuels (XOR)
    CONSTRAINT chk_document_type 
        CHECK (
            (type_document IN ('BSDI', 'PV_DESTRUCTION') AND enlevement_id IS NOT NULL AND periode_mois IS NULL)
            OR
            (type_document IN ('ATTESTATION_VALORISATION', 'ATTESTATION_ELIMINATION', 'FACTURE') AND enlevement_id IS NULL AND periode_mois IS NOT NULL)
        )
);

CREATE INDEX IF NOT EXISTS idx_document_enlevement ON document(enlevement_id);
CREATE INDEX IF NOT EXISTS idx_document_societe ON document(societe_id);
CREATE INDEX IF NOT EXISTS idx_document_periode ON document(periode_mois);
CREATE INDEX IF NOT EXISTS idx_document_type ON document(type_document);

-- ============================================
-- 7. DONNÉES DE DÉMONSTRATION
-- ============================================

-- Sociétés de démonstration
INSERT INTO societe (id, raison_sociale, ice, email, telephone, commentaire) VALUES 
(1, 'YAZAKI MOROCCO KENITRA', '002345678901234', 'contact@yazaki.ma', '0537123456', 'Contrat annuel - 2 collectes/semaine - Industrie automobile'),
(2, 'MARJANE TANGER', '002345678901235', 'environnement@marjane.ma', '0539123456', 'Grande distribution - Collectes hebdomadaires'),
(3, 'CHU HASSAN II FES', '002345678901236', 'dechets@chu-fes.ma', '0535123456', 'Établissement de santé - Déchets médicaux quotidiens')
ON CONFLICT (id) DO NOTHING;

-- Utilisateurs de démonstration
INSERT INTO client_user (nom, prenom, poste_occupe, email, telephone, societe_id, active) VALUES
('BENNANI', 'Sarah', 'Responsable Environnement et RSE', 's.bennani@yazaki.ma', '0661234567', 1, true),
('ALAMI', 'Karim', 'Responsable Qualité', 'k.alami@marjane.ma', '0662345678', 2, true),
('TAZI', 'Amina', 'Directrice des Services Techniques', 'a.tazi@chu-fes.ma', '0663456789', 3, true)
ON CONFLICT (email) DO NOTHING;

-- Sites de démonstration
INSERT INTO site (id, societe_id, name, adresse) VALUES
(1, 1, 'Usine principale Kenitra', 'Zone industrielle, Route de Rabat, Kenitra 14000'),
(2, 1, 'Entrepôt logistique', 'Zone franche, Tanger Med, Tanger 90000'),
(3, 2, 'Hypermarché Tanger', 'Boulevard Mohammed VI, Tanger 90000'),
(4, 3, 'Hôpital principal', 'Avenue Hassan II, Fès 30000')
ON CONFLICT (id) DO NOTHING;

-- Enlèvements de démonstration
INSERT INTO enlevement (id, numero_enlevement, date_enlevement, site_id, societe_id, observation, created_by) VALUES
(1, 'ENL-2024-0001', '2024-11-15', 1, 1, 'Collecte régulière - Bon tri', 'admin'),
(2, 'ENL-2024-0002', '2024-11-18', 1, 1, 'Collecte régulière', 'admin'),
(3, 'ENL-2024-0003', '2024-11-20', 3, 2, 'Collecte hebdomadaire - Carton principalement', 'admin'),
(4, 'ENL-2024-0004', '2024-11-25', 4, 3, 'Déchets médicaux - DASRI', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Items de démonstration
-- Enlèvement 1 : YAZAKI (Valorisables)
INSERT INTO pickup_item (id, enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad) VALUES
(1, 1, 'VALORISABLE', 'CARTON', 150.000, 1.20, 180.00),
(2, 1, 'VALORISABLE', 'PLASTIQUE_PET', 80.000, 2.50, 200.00),
(3, 1, 'VALORISABLE', 'ALUMINIUM', 25.000, 8.00, 200.00),
(4, 1, 'BANAL', NULL, 45.000, 0.30, 13.50)
ON CONFLICT (id) DO NOTHING;

-- Enlèvement 2 : YAZAKI (Valorisables + Banal)
INSERT INTO pickup_item (id, enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad) VALUES
(5, 2, 'VALORISABLE', 'CARTON', 120.000, 1.20, 144.00),
(6, 2, 'VALORISABLE', 'FER', 200.000, 0.80, 160.00),
(7, 2, 'BANAL', NULL, 50.000, 0.30, 15.00)
ON CONFLICT (id) DO NOTHING;

-- Enlèvement 3 : MARJANE (Principalement carton)
INSERT INTO pickup_item (id, enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad) VALUES
(8, 3, 'VALORISABLE', 'CARTON', 350.000, 1.20, 420.00),
(9, 3, 'VALORISABLE', 'PLASTIQUE_PET', 45.000, 2.50, 112.50),
(10, 3, 'BANAL', NULL, 25.000, 0.30, 7.50)
ON CONFLICT (id) DO NOTHING;

-- Enlèvement 4 : CHU (Déchets médicaux - A_ELIMINER)
INSERT INTO pickup_item (id, enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad) VALUES
(11, 4, 'A_ELIMINER', 'DASRI', 45.000, 8.00, 360.00),
(12, 4, 'BANAL', NULL, 12.000, 0.30, 3.60)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. SÉQUENCES (pour compatibilité)
-- ============================================
SELECT setval('societe_id_seq', (SELECT MAX(id) FROM societe));
SELECT setval('client_user_id_seq', (SELECT MAX(id) FROM client_user));
SELECT setval('site_id_seq', (SELECT MAX(id) FROM site));
SELECT setval('enlevement_id_seq', (SELECT MAX(id) FROM enlevement));
SELECT setval('pickup_item_id_seq', (SELECT MAX(id) FROM pickup_item));

-- ============================================
-- 9. COMMENTAIRES SUR LES TABLES
-- ============================================
COMMENT ON TABLE societe IS 'Entreprises clientes - Possède un ICE unique';
COMMENT ON TABLE client_user IS 'Utilisateurs rattachés à une société - Ne voient que les données de leur société';
COMMENT ON TABLE site IS 'Sites de collecte d''une société';
COMMENT ON TABLE enlevement IS 'Enlèvements (collectes) effectués';
COMMENT ON TABLE pickup_item IS 'Lignes de détail d''un enlèvement - Types: VALORISABLE, BANAL, A_ELIMINER';
COMMENT ON TABLE document IS 'Documents: BSDI/PV (par enlèvement) ou Attestations/Factures (mensuels)';

COMMENT ON COLUMN societe.ice IS 'Identifiant Commun de l''Entreprise (15 chiffres) - UNIQUE';
COMMENT ON COLUMN pickup_item.type_dechet IS 'VALORISABLE (revenu), BANAL (coût), A_ELIMINER (coût + docs obligatoires)';
COMMENT ON COLUMN pickup_item.montant_mad IS 'Montant = quantite_kg × prix_unitaire_mad';
COMMENT ON COLUMN document.type_document IS 'BSDI/PV (enlevement_id NOT NULL) ou ATTESTATION*/FACTURE (periode_mois NOT NULL)';

