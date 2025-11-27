-- ===========================================
-- V3: Enhanced Pickup System
-- ===========================================
-- Ajout des tables et colonnes pour le système d'enlèvements complet
-- avec support des sites, items détaillés et documents

-- Enum PickupType
CREATE TYPE pickup_type AS ENUM ('RECYCLABLE', 'BANAL', 'DANGEREUX');

-- Table des sites
CREATE TABLE site (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pickups 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'BANAL';

ALTER TABLE pickups 
ADD COLUMN IF NOT EXISTS site_id BIGINT REFERENCES site(id) ON DELETE SET NULL;

-- Table des items d'enlèvement (pour les recyclables détaillés)
CREATE TABLE pickup_item (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    material VARCHAR(40) NOT NULL,
    qty_kg NUMERIC(10,3) NOT NULL CHECK (qty_kg > 0),
    price_mad_per_kg NUMERIC(10,3) NOT NULL CHECK (price_mad_per_kg >= 0),
    total_mad NUMERIC(12,2) GENERATED ALWAYS AS (qty_kg * price_mad_per_kg) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents
CREATE TABLE document (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL CHECK (doc_type IN ('BORDEREAU', 'CERTIFICAT', 'FACTURE', 'PHOTO')),
    filename TEXT NOT NULL,
    object_key TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50)
);

-- Index pour les performances
CREATE INDEX idx_pickup_client_date ON pickups(client_id, date DESC);
CREATE INDEX idx_pickup_site ON pickups(site_id);
CREATE INDEX idx_pickup_type ON pickups(type);
CREATE INDEX idx_pickup_item_pickup ON pickup_item(pickup_id);
CREATE INDEX idx_doc_pickup ON document(pickup_id);
CREATE INDEX idx_doc_type ON document(doc_type);
CREATE INDEX idx_site_client ON site(client_id);

-- Données de test
INSERT INTO site (client_id, name, address, contact_phone) VALUES 
(1, 'Site Principal', '123 Rue de la Recyclerie, Casablanca', '+212 5 22 123 456');

-- Mise à jour des pickups existants pour les associer au site principal
UPDATE pickups SET site_id = 1 WHERE site_id IS NULL;

-- Ajout d'items détaillés pour 2 pickups recyclables
INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg) VALUES
-- Pour le premier pickup recyclable (s'il existe)
((SELECT id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1), 'Papier', 150.5, 2.5),
((SELECT id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1), 'Carton', 200.0, 1.8),
((SELECT id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1), 'Plastique PET', 75.2, 4.2),
-- Pour le deuxième pickup recyclable
((SELECT id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1 OFFSET 1), 'Métal', 120.8, 6.5),
((SELECT id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1 OFFSET 1), 'Verre', 95.3, 0.8);

-- Commentaires sur les tables
COMMENT ON TABLE site IS 'Sites de collecte des clients';
COMMENT ON TABLE pickup_item IS 'Items détaillés pour les enlèvements recyclables';
COMMENT ON TABLE document IS 'Documents associés aux enlèvements (bordereaux, certificats, etc.)';

COMMENT ON COLUMN pickups.type IS 'Type d''enlèvement: RECYCLABLE, BANAL, DANGEREUX';
COMMENT ON COLUMN pickups.site_id IS 'Site de collecte (optionnel)';
COMMENT ON COLUMN pickup_item.material IS 'Type de matériau recyclable';
COMMENT ON COLUMN pickup_item.qty_kg IS 'Quantité en kilogrammes';
COMMENT ON COLUMN pickup_item.price_mad_per_kg IS 'Prix unitaire en MAD par kg';
COMMENT ON COLUMN pickup_item.total_mad IS 'Total calculé automatiquement';
COMMENT ON COLUMN document.doc_type IS 'Type de document: BORDEREAU, CERTIFICAT, FACTURE, PHOTO';
COMMENT ON COLUMN document.object_key IS 'Clé S3/MinIO pour le stockage';
COMMENT ON COLUMN document.filename IS 'Nom original du fichier';
