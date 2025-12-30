-- Migration initiale pour IORecycling
-- Création des tables et données de démonstration
-- Migration idempotente pour éviter les erreurs si les objets existent déjà

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des collectes (pickups)
CREATE TABLE IF NOT EXISTS pickups (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    date DATE NOT NULL,
    kg_valorisables DECIMAL(10,2) DEFAULT 0.0,
    kg_banals DECIMAL(10,2) DEFAULT 0.0,
    kg_dangereux DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_pickups_client_id ON pickups(client_id);
CREATE INDEX IF NOT EXISTS idx_pickups_date ON pickups(date);
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);

-- Données de démonstration (insertion uniquement si n'existent pas)
INSERT INTO clients (id, name, code) VALUES 
(1, 'Client Démo 1', 'client1'),
(2, 'Client Démo 2', 'client2'),
(3, 'Client Démo 3', 'client3')
ON CONFLICT (id) DO NOTHING;

-- Collectes de démonstration pour client1
INSERT INTO pickups (id, client_id, date, kg_valorisables, kg_banals, kg_dangereux) VALUES 
(1, 1, '2024-01-15', 25.5, 15.2, 2.1),
(2, 1, '2024-01-22', 30.0, 18.5, 1.8),
(3, 1, '2024-01-29', 22.3, 12.7, 3.2)
ON CONFLICT (id) DO NOTHING;

-- Collectes de démonstration pour client2
INSERT INTO pickups (id, client_id, date, kg_valorisables, kg_banals, kg_dangereux) VALUES 
(4, 2, '2024-01-16', 18.7, 10.3, 1.5),
(5, 2, '2024-01-23', 28.9, 16.8, 2.3)
ON CONFLICT (id) DO NOTHING;

-- Collectes de démonstration pour client3
INSERT INTO pickups (id, client_id, date, kg_valorisables, kg_banals, kg_dangereux) VALUES 
(6, 3, '2024-01-17', 35.2, 20.1, 4.1),
(7, 3, '2024-01-24', 27.6, 14.9, 2.7),
(8, 3, '2024-01-31', 31.8, 19.3, 3.5)
ON CONFLICT (id) DO NOTHING;

-- Commentaires sur les tables
COMMENT ON TABLE clients IS 'Table des clients IORecycling';
COMMENT ON TABLE pickups IS 'Table des collectes de déchets par client';

COMMENT ON COLUMN clients.name IS 'Nom du client';
COMMENT ON COLUMN clients.code IS 'Code unique du client';

COMMENT ON COLUMN pickups.date IS 'Date de la collecte';
COMMENT ON COLUMN pickups.kg_valorisables IS 'Poids en kg des déchets valorisables';
COMMENT ON COLUMN pickups.kg_banals IS 'Poids en kg des déchets banals';
COMMENT ON COLUMN pickups.kg_dangereux IS 'Poids en kg des déchets dangereux';
