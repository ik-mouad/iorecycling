-- ============================================
-- V18: Refonte V2 - Recettes (Prestation + Vente) et Module Vente
-- ============================================

-- 1. MODIFICATIONS TABLE pickup_item
-- ============================================

-- Prix et montant prestation (pour tous types de déchets)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_prestation_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_prestation_mad DECIMAL(12, 2);

-- Prix et montant achat (pour déchets valorisables)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_achat_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_achat_mad DECIMAL(12, 2);

-- Prix et montant traitement (pour déchets banals)
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS prix_traitement_mad DECIMAL(10, 3);
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS montant_traitement_mad DECIMAL(12, 2);

-- Suivi des quantités pour la vente
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS quantite_vendue_kg DECIMAL(10, 3) DEFAULT 0;
ALTER TABLE pickup_item ADD COLUMN IF NOT EXISTS reste_a_vendre_kg DECIMAL(10, 3);

-- Calcul initial du reste à vendre pour les données existantes
UPDATE pickup_item 
SET reste_a_vendre_kg = quantite_kg - COALESCE(quantite_vendue_kg, 0)
WHERE reste_a_vendre_kg IS NULL;

-- 2. NOUVELLE TABLE vente
-- ============================================

CREATE TABLE IF NOT EXISTS vente (
    id BIGSERIAL PRIMARY KEY,
    numero_vente VARCHAR(50) UNIQUE,
    date_vente DATE NOT NULL,
    acheteur_id BIGINT,
    acheteur_nom VARCHAR(200),
    observation TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON' 
        CHECK (statut IN ('BROUILLON', 'VALIDEE', 'ANNULEE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_vente_date ON vente(date_vente);
CREATE INDEX idx_vente_statut ON vente(statut);
CREATE INDEX idx_vente_acheteur ON vente(acheteur_id);

-- 3. NOUVELLE TABLE vente_item
-- ============================================

CREATE TABLE IF NOT EXISTS vente_item (
    id BIGSERIAL PRIMARY KEY,
    vente_id BIGINT NOT NULL,
    pickup_item_id BIGINT,
    type_dechet VARCHAR(20) NOT NULL,
    sous_type VARCHAR(50),
    quantite_vendue_kg DECIMAL(10, 3) NOT NULL CHECK (quantite_vendue_kg > 0),
    prix_vente_unitaire_mad DECIMAL(10, 3) NOT NULL CHECK (prix_vente_unitaire_mad > 0),
    montant_vente_mad DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES vente(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_item_id) REFERENCES pickup_item(id) ON DELETE SET NULL
);

CREATE INDEX idx_vente_item_vente ON vente_item(vente_id);
CREATE INDEX idx_vente_item_pickup ON vente_item(pickup_item_id);
CREATE INDEX idx_vente_item_type ON vente_item(type_dechet, sous_type);

-- 4. MODIFICATIONS TABLE transaction
-- ============================================

-- Distinction type recette
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS type_recette VARCHAR(20);
-- Valeurs possibles : 'PRESTATION', 'VENTE_MATIERE', NULL (pour dépenses)

-- Lien vers vente_item pour les recettes vente matière
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS vente_item_id BIGINT;
ALTER TABLE transaction DROP CONSTRAINT IF EXISTS fk_transaction_vente_item;
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_vente_item 
    FOREIGN KEY (vente_item_id) REFERENCES vente_item(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transaction_type_recette ON transaction(type_recette);
CREATE INDEX IF NOT EXISTS idx_transaction_vente_item ON transaction(vente_item_id);

-- 5. TRIGGERS POUR CALCULS AUTOMATIQUES
-- ============================================

-- Fonction pour calculer les montants et reste à vendre
CREATE OR REPLACE FUNCTION calculate_pickup_item_amounts()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcul montant prestation
    IF NEW.prix_prestation_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_prestation_mad := NEW.quantite_kg * NEW.prix_prestation_mad;
    END IF;
    
    -- Calcul montant achat (si valorisable)
    IF NEW.type_dechet = 'RECYCLABLE' AND NEW.prix_achat_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_achat_mad := NEW.quantite_kg * NEW.prix_achat_mad;
    END IF;
    
    -- Calcul montant traitement (si banal)
    IF NEW.type_dechet IN ('BANAL', 'A_DETRUIRE') AND NEW.prix_traitement_mad IS NOT NULL AND NEW.quantite_kg IS NOT NULL THEN
        NEW.montant_traitement_mad := NEW.quantite_kg * NEW.prix_traitement_mad;
    END IF;
    
    -- Calcul reste à vendre
    IF NEW.quantite_kg IS NOT NULL THEN
        NEW.reste_a_vendre_kg := NEW.quantite_kg - COALESCE(NEW.quantite_vendue_kg, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger avant insert/update
DROP TRIGGER IF EXISTS trg_calculate_pickup_item_amounts ON pickup_item;
CREATE TRIGGER trg_calculate_pickup_item_amounts
    BEFORE INSERT OR UPDATE ON pickup_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_pickup_item_amounts();

-- Fonction pour calculer montant vente_item
CREATE OR REPLACE FUNCTION calculate_vente_item_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantite_vendue_kg IS NOT NULL AND NEW.prix_vente_unitaire_mad IS NOT NULL THEN
        NEW.montant_vente_mad := NEW.quantite_vendue_kg * NEW.prix_vente_unitaire_mad;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vente_item
DROP TRIGGER IF EXISTS trg_calculate_vente_item_amount ON vente_item;
CREATE TRIGGER trg_calculate_vente_item_amount
    BEFORE INSERT OR UPDATE ON vente_item
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vente_item_amount();

-- 6. VUES UTILITAIRES
-- ============================================

-- Vue pour stocks disponibles à la vente
CREATE OR REPLACE VIEW v_stocks_disponibles AS
SELECT 
    pi.id AS pickup_item_id,
    pi.enlevement_id,
    e.numero_enlevement,
    e.date_enlevement,
    e.societe_id,
    s.raison_sociale AS societe_nom,
    pi.type_dechet,
    pi.sous_type,
    pi.quantite_kg AS quantite_recuperee_kg,
    COALESCE(pi.quantite_vendue_kg, 0) AS quantite_vendue_kg,
    COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) AS reste_a_vendre_kg,
    CASE 
        WHEN COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) = 0 THEN 'VENDU'
        WHEN COALESCE(pi.quantite_vendue_kg, 0) = 0 THEN 'NON_VENDU'
        ELSE 'PARTIELLEMENT_VENDU'
    END AS statut_stock
FROM pickup_item pi
JOIN enlevement e ON e.id = pi.enlevement_id
JOIN societe s ON s.id = e.societe_id
WHERE COALESCE(pi.reste_a_vendre_kg, pi.quantite_kg) > 0;

-- Vue pour synthèse financière par enlèvement
CREATE OR REPLACE VIEW v_enlevement_financier AS
SELECT 
    e.id AS enlevement_id,
    e.numero_enlevement,
    e.date_enlevement,
    e.societe_id,
    -- Totaux prestation
    COALESCE(SUM(pi.montant_prestation_mad), 0) AS total_prestation,
    -- Totaux achat (valorisable)
    COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_achat_mad ELSE 0 END), 0) AS total_achat,
    -- Totaux traitement (banal)
    COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS total_traitement,
    -- Bilan net
    COALESCE(SUM(pi.montant_prestation_mad), 0) 
    - COALESCE(SUM(CASE WHEN pi.type_dechet = 'RECYCLABLE' THEN pi.montant_achat_mad ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN pi.type_dechet IN ('BANAL', 'A_DETRUIRE') THEN pi.montant_traitement_mad ELSE 0 END), 0) AS bilan_net
FROM enlevement e
LEFT JOIN pickup_item pi ON pi.enlevement_id = e.id
GROUP BY e.id, e.numero_enlevement, e.date_enlevement, e.societe_id;

-- 7. COMMENTAIRES
-- ============================================

COMMENT ON COLUMN pickup_item.prix_prestation_mad IS 'Prix de prestation d''enlèvement (MAD/kg) - Tous types de déchets';
COMMENT ON COLUMN pickup_item.montant_prestation_mad IS 'Montant prestation = quantite_kg × prix_prestation_mad';
COMMENT ON COLUMN pickup_item.prix_achat_mad IS 'Prix d''achat au client (MAD/kg) - Uniquement pour RECYCLABLE';
COMMENT ON COLUMN pickup_item.prix_traitement_mad IS 'Prix de traitement (MAD/kg) - Uniquement pour BANAL/A_DETRUIRE';
COMMENT ON COLUMN pickup_item.quantite_vendue_kg IS 'Quantité totale vendue depuis cet item';
COMMENT ON COLUMN pickup_item.reste_a_vendre_kg IS 'Quantité restante à vendre = quantite_kg - quantite_vendue_kg';
COMMENT ON COLUMN transaction.type_recette IS 'Type de recette : PRESTATION ou VENTE_MATIERE (NULL pour dépenses)';
COMMENT ON COLUMN transaction.vente_item_id IS 'Lien vers le vente_item source (si recette vente matière)';
COMMENT ON TABLE vente IS 'Ventes de déchets à des acheteurs';
COMMENT ON TABLE vente_item IS 'Lignes de détail d''une vente';

