-- Migration V2: Ajout des types d'enlèvement, sites, items et documents

-- 1. Création de la table sites
CREATE TABLE IF NOT EXISTS sites (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ajout des colonnes type et site_id à la table pickups
ALTER TABLE pickups 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'BANAL',
ADD COLUMN IF NOT EXISTS site_id BIGINT NULL REFERENCES sites(id) ON DELETE SET NULL;

-- 3. Création de la table pickup_items pour les détails valorisables
CREATE TABLE IF NOT EXISTS pickup_items (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    material VARCHAR(40) NOT NULL,
    qty_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_mad_per_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Création de la table documents
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    doc_type VARCHAR(30) NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sites_client_id ON sites(client_id);
CREATE INDEX IF NOT EXISTS idx_pickups_type ON pickups(type);
CREATE INDEX IF NOT EXISTS idx_pickups_site_id ON pickups(site_id);
CREATE INDEX IF NOT EXISTS idx_pickup_items_pickup_id ON pickup_items(pickup_id);
CREATE INDEX IF NOT EXISTS idx_documents_pickup_id ON documents(pickup_id);

-- 6. Données de démonstration
-- Site pour le client 1
INSERT INTO sites (client_id, name) 
VALUES (1, 'Site Principal - Casablanca')
ON CONFLICT DO NOTHING;

-- Mise à jour des pickups existants avec des types et sites
UPDATE pickups 
SET type = CASE 
    WHEN id % 3 = 0 THEN 'RECYCLABLE'
    WHEN id % 3 = 1 THEN 'BANAL'
    ELSE 'DANGEREUX'
END,
site_id = 1
WHERE site_id IS NULL;

-- Ajout de pickups de démonstration avec dates étalées
INSERT INTO pickups (client_id, date, kg_valorisables, kg_banals, kg_dangereux, type, site_id)
VALUES 
    (1, CURRENT_DATE - INTERVAL '30 days', 150.5, 0, 0, 'RECYCLABLE', 1),
    (1, CURRENT_DATE - INTERVAL '25 days', 0, 75.2, 0, 'BANAL', 1),
    (1, CURRENT_DATE - INTERVAL '20 days', 0, 0, 25.8, 'DANGEREUX', 1),
    (1, CURRENT_DATE - INTERVAL '15 days', 200.3, 0, 0, 'RECYCLABLE', 1),
    (1, CURRENT_DATE - INTERVAL '10 days', 0, 120.7, 0, 'BANAL', 1),
    (1, CURRENT_DATE - INTERVAL '5 days', 0, 0, 18.4, 'DANGEREUX', 1),
    (1, CURRENT_DATE - INTERVAL '2 days', 180.9, 0, 0, 'RECYCLABLE', 1)
ON CONFLICT DO NOTHING;

-- Items valorisables pour les pickups RECYCLABLE
INSERT INTO pickup_items (pickup_id, material, qty_kg, price_mad_per_kg)
SELECT 
    p.id,
    'CARTON',
    p.kg_valorisables * 0.6,
    1.5
FROM pickups p 
WHERE p.type = 'RECYCLABLE' 
AND p.kg_valorisables > 0
ON CONFLICT DO NOTHING;

INSERT INTO pickup_items (pickup_id, material, qty_kg, price_mad_per_kg)
SELECT 
    p.id,
    'PLASTIQUE',
    p.kg_valorisables * 0.4,
    2.0
FROM pickups p 
WHERE p.type = 'RECYCLABLE' 
AND p.kg_valorisables > 0
ON CONFLICT DO NOTHING;

-- Documents pour chaque pickup
INSERT INTO documents (pickup_id, doc_type, filename, url)
SELECT 
    p.id,
    'BORDEREAU',
    'Bordereau_' || p.id || '.pdf',
    'https://demo.iorecycling.ma/documents/bordereau_' || p.id || '.pdf'
FROM pickups p
ON CONFLICT DO NOTHING;

INSERT INTO documents (pickup_id, doc_type, filename, url)
SELECT 
    p.id,
    'CERTIFICAT',
    'Certificat_' || p.id || '.pdf',
    'https://demo.iorecycling.ma/documents/certificat_' || p.id || '.pdf'
FROM pickups p
WHERE p.type = 'RECYCLABLE'
ON CONFLICT DO NOTHING;

INSERT INTO documents (pickup_id, doc_type, filename, url)
SELECT 
    p.id,
    'FACTURE',
    'Facture_' || p.id || '.pdf',
    'https://demo.iorecycling.ma/documents/facture_' || p.id || '.pdf'
FROM pickups p
WHERE p.type = 'RECYCLABLE'
ON CONFLICT DO NOTHING;

-- Commentaires pour documentation
COMMENT ON TABLE sites IS 'Sites de collecte des clients';
COMMENT ON TABLE pickup_items IS 'Détails des matériaux valorisables par enlèvement';
COMMENT ON TABLE documents IS 'Documents associés aux enlèvements (bordereaux, certificats, factures)';
COMMENT ON COLUMN pickups.type IS 'Type d''enlèvement: RECYCLABLE, BANAL, DANGEREUX';
COMMENT ON COLUMN pickups.site_id IS 'Site de collecte (optionnel)';
COMMENT ON COLUMN pickup_items.material IS 'Type de matériau: CARTON, PLASTIQUE, METAL, etc.';
COMMENT ON COLUMN pickup_items.qty_kg IS 'Quantité en kilogrammes';
COMMENT ON COLUMN pickup_items.price_mad_per_kg IS 'Prix unitaire en dirhams marocains par kg';
COMMENT ON COLUMN documents.doc_type IS 'Type de document: BORDEREAU, CERTIFICAT, FACTURE';
