#!/usr/bin/env bash
set -euo pipefail

# This script makes Flyway V3 idempotent to avoid failures when parts of it
# were already applied (e.g., columns or tables already exist).

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
V3_FILE="$ROOT_DIR/backend/src/main/resources/db/migration/V3__enhanced_pickup_system.sql"

if [ ! -f "$V3_FILE" ]; then
  echo "❌ V3 migration not found at: $V3_FILE" >&2
  exit 1
fi

cp "$V3_FILE" "${V3_FILE}.bak.$(date +%Y%m%d%H%M%S)"

cat >"$V3_FILE" <<'SQL'
-- ===========================================
-- V3: Enhanced Pickup System (idempotent)
-- ===========================================

-- Create enum type only if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pickup_type') THEN
    CREATE TYPE pickup_type AS ENUM ('RECYCLABLE', 'BANAL', 'DANGEREUX');
  END IF;
END$$;

-- Sites table
CREATE TABLE IF NOT EXISTS site (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to existing pickups table if missing
ALTER TABLE pickups 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'BANAL',
ADD COLUMN IF NOT EXISTS site_id BIGINT REFERENCES site(id) ON DELETE SET NULL;

-- Items table
CREATE TABLE IF NOT EXISTS pickup_item (
    id BIGSERIAL PRIMARY KEY,
    pickup_id BIGINT NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    material VARCHAR(40) NOT NULL,
    qty_kg NUMERIC(10,3) NOT NULL CHECK (qty_kg > 0),
    price_mad_per_kg NUMERIC(10,3) NOT NULL CHECK (price_mad_per_kg >= 0),
    total_mad NUMERIC(12,2) GENERATED ALWAYS AS (qty_kg * price_mad_per_kg) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
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

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_pickup_client_date ON pickups(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pickup_site ON pickups(site_id);
CREATE INDEX IF NOT EXISTS idx_pickup_type ON pickups(type);
CREATE INDEX IF NOT EXISTS idx_pickup_item_pickup ON pickup_item(pickup_id);
CREATE INDEX IF NOT EXISTS idx_doc_pickup ON document(pickup_id);
CREATE INDEX IF NOT EXISTS idx_doc_type ON document(doc_type);

-- Seed a default site for client 1 if not present
INSERT INTO site (client_id, name, address, contact_phone)
SELECT 1, 'Site Principal', '123 Rue de la Recyclerie, Casablanca', '+212 5 22 123 456'
WHERE NOT EXISTS (SELECT 1 FROM site WHERE client_id = 1 AND name = 'Site Principal');

-- Associate existing pickups without site to site id 1 if it exists
UPDATE pickups SET site_id = 1
WHERE site_id IS NULL AND EXISTS (SELECT 1 FROM site WHERE id = 1);

SQL

echo "✅ Updated V3 to be idempotent: $V3_FILE"

