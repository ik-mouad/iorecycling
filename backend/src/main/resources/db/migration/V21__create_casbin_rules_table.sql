-- Table pour stocker les règles Casbin
CREATE TABLE IF NOT EXISTS casbin_rule (
    id SERIAL PRIMARY KEY,
    ptype VARCHAR(100) NOT NULL,
    v0 VARCHAR(100),
    v1 VARCHAR(100),
    v2 VARCHAR(100),
    v3 VARCHAR(100),
    v4 VARCHAR(100),
    v5 VARCHAR(100)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_casbin_rule_ptype ON casbin_rule(ptype);
CREATE INDEX IF NOT EXISTS idx_casbin_rule_v0 ON casbin_rule(v0);

-- Insérer les politiques initiales depuis policy.csv
-- Format: p, role, resource, action -> ptype='p', v0=role, v1=resource, v2=action

-- ADMIN permissions
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'societes', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'societes', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'enlevements', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'enlevements', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'demandes', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'demandes', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'planning', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'planning', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'recurrences', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'recurrences', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'camions', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'camions', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'destinations', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'destinations', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'ADMIN', 'swagger', 'read') ON CONFLICT DO NOTHING;

-- COMPTABLE permissions
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'comptabilite', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'comptabilite', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'ventes', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'ventes', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'stocks', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'stocks', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'enlevements', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'COMPTABLE', 'demandes', 'read') ON CONFLICT DO NOTHING;

-- CLIENT permissions
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'CLIENT', 'demandes', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'CLIENT', 'demandes', 'write') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'CLIENT', 'enlevements', 'read') ON CONFLICT DO NOTHING;
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', 'CLIENT', 'enlevements', 'write') ON CONFLICT DO NOTHING;

