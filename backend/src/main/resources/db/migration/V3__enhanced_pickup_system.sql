-- ===========================================
-- V3: Enhanced Pickup System (IDEMPOTENT)
-- ===========================================
-- Ajout des tables et colonnes pour le système d'enlèvements complet
-- avec support des sites, items détaillés et documents

-- Enum PickupType (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pickup_type') THEN
        CREATE TYPE pickup_type AS ENUM ('RECYCLABLE', 'BANAL', 'DANGEREUX');
    END IF;
END$$;

-- Gestion de la table site : renommer sites en site si elle existe, sinon créer site
DO $$
BEGIN
    -- Si la table sites existe (de V2), la renommer en site
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites') THEN
        -- Renommer la table
        ALTER TABLE sites RENAME TO site;
        -- Renommer l'index si il existe
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sites_client_id') THEN
            ALTER INDEX idx_sites_client_id RENAME TO idx_site_client;
        END IF;
    END IF;
    
    -- Si site n'existe toujours pas, la créer
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site') THEN
        CREATE TABLE site (
            id BIGSERIAL PRIMARY KEY,
            client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            address TEXT,
            contact_phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Ajouter les colonnes manquantes si la table existe déjà
        ALTER TABLE site ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE site ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
    END IF;
END$$;

-- Ajout des colonnes à pickups (idempotent)
ALTER TABLE pickups 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'BANAL';

-- Mise à jour de la référence site_id pour pointer vers site au lieu de sites
DO $$
DECLARE
    constraint_name_var TEXT;
BEGIN
    -- Ajouter la colonne si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pickups' AND column_name = 'site_id'
    ) THEN
        ALTER TABLE pickups ADD COLUMN site_id BIGINT;
    END IF;
    
    -- Trouver et supprimer toutes les contraintes de clé étrangère sur site_id
    FOR constraint_name_var IN
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'pickups' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name IN (
            SELECT constraint_name 
            FROM information_schema.key_column_usage 
            WHERE table_name = 'pickups' 
            AND column_name = 'site_id'
        )
    LOOP
        EXECUTE 'ALTER TABLE pickups DROP CONSTRAINT IF EXISTS ' || constraint_name_var;
    END LOOP;
    
    -- Ajouter la nouvelle contrainte seulement si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pickups' 
        AND constraint_name = 'pickups_site_id_fkey'
    ) THEN
        ALTER TABLE pickups 
        ADD CONSTRAINT pickups_site_id_fkey 
        FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
END$$;

-- Table des items d'enlèvement (idempotent)
CREATE TABLE IF NOT EXISTS pickup_item (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    material VARCHAR(40) NOT NULL,
    qty_kg NUMERIC(10,3) NOT NULL CHECK (qty_kg > 0),
    price_mad_per_kg NUMERIC(10,3) NOT NULL CHECK (price_mad_per_kg >= 0),
    total_mad NUMERIC(12,2) GENERATED ALWAYS AS (qty_kg * price_mad_per_kg) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents (idempotent)
CREATE TABLE IF NOT EXISTS document (
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

-- Index pour les performances (idempotents)
CREATE INDEX IF NOT EXISTS idx_pickup_client_date ON pickups(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pickup_site ON pickups(site_id);
CREATE INDEX IF NOT EXISTS idx_pickup_type ON pickups(type);
CREATE INDEX IF NOT EXISTS idx_pickup_item_pickup ON pickup_item(pickup_id);
CREATE INDEX IF NOT EXISTS idx_doc_pickup ON document(pickup_id);
CREATE INDEX IF NOT EXISTS idx_doc_type ON document(doc_type);
CREATE INDEX IF NOT EXISTS idx_site_client ON site(client_id);

-- Données de test (idempotent)
INSERT INTO site (client_id, name, address, contact_phone) 
SELECT 1, 'Site Principal', '123 Rue de la Recyclerie, Casablanca', '+212 5 22 123 456'
WHERE NOT EXISTS (SELECT 1 FROM site WHERE client_id = 1 AND name = 'Site Principal');

-- Mise à jour des pickups existants pour les associer au site principal
UPDATE pickups SET site_id = (SELECT id FROM site WHERE client_id = 1 LIMIT 1) 
WHERE site_id IS NULL 
AND EXISTS (SELECT 1 FROM site WHERE client_id = 1);

-- Ajout d'items détaillés pour 2 pickups recyclables (idempotent)
DO $$
DECLARE
    pickup1_id BIGINT;
    pickup2_id BIGINT;
BEGIN
    -- Récupérer les IDs des pickups recyclables
    SELECT id INTO pickup1_id FROM pickups WHERE type = 'RECYCLABLE' LIMIT 1;
    SELECT id INTO pickup2_id FROM pickups WHERE type = 'RECYCLABLE' OFFSET 1 LIMIT 1;
    
    -- Insérer les items seulement si les pickups existent et que les items n'existent pas déjà
    IF pickup1_id IS NOT NULL THEN
        INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg)
        SELECT pickup1_id, 'Papier', 150.5, 2.5
        WHERE NOT EXISTS (SELECT 1 FROM pickup_item WHERE pickup_id = pickup1_id AND material = 'Papier');
        
        INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg)
        SELECT pickup1_id, 'Carton', 200.0, 1.8
        WHERE NOT EXISTS (SELECT 1 FROM pickup_item WHERE pickup_id = pickup1_id AND material = 'Carton');
        
        INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg)
        SELECT pickup1_id, 'Plastique PET', 75.2, 4.2
        WHERE NOT EXISTS (SELECT 1 FROM pickup_item WHERE pickup_id = pickup1_id AND material = 'Plastique PET');
    END IF;
    
    IF pickup2_id IS NOT NULL THEN
        INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg)
        SELECT pickup2_id, 'Métal', 120.8, 6.5
        WHERE NOT EXISTS (SELECT 1 FROM pickup_item WHERE pickup_id = pickup2_id AND material = 'Métal');
        
        INSERT INTO pickup_item (pickup_id, material, qty_kg, price_mad_per_kg)
        SELECT pickup2_id, 'Verre', 95.3, 0.8
        WHERE NOT EXISTS (SELECT 1 FROM pickup_item WHERE pickup_id = pickup2_id AND material = 'Verre');
    END IF;
END$$;

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
