-- Migration V14 : Mise à jour de la contrainte type_dechet
-- Remplace VALORISABLE par RECYCLABLE et A_ELIMINER par A_DETRUIRE

-- ============================================
-- SUPPRESSION DE L'ANCIENNE CONTRAINTE
-- ============================================
ALTER TABLE pickup_item DROP CONSTRAINT IF EXISTS pickup_item_type_dechet_check;

-- ============================================
-- MISE À JOUR DES DONNÉES EXISTANTES
-- ============================================
UPDATE pickup_item SET type_dechet = 'RECYCLABLE' WHERE type_dechet = 'VALORISABLE';
UPDATE pickup_item SET type_dechet = 'A_DETRUIRE' WHERE type_dechet = 'A_ELIMINER';

-- ============================================
-- CRÉATION DE LA NOUVELLE CONTRAINTE
-- ============================================
ALTER TABLE pickup_item 
ADD CONSTRAINT pickup_item_type_dechet_check 
CHECK (type_dechet IN ('RECYCLABLE', 'BANAL', 'A_DETRUIRE'));

-- ============================================
-- MISE À JOUR DES COMMENTAIRES
-- ============================================
COMMENT ON TABLE pickup_item IS 'Lignes de détail d''un enlèvement - Types: RECYCLABLE, BANAL, A_DETRUIRE';
COMMENT ON COLUMN pickup_item.type_dechet IS 'RECYCLABLE (revenu), BANAL (coût), A_DETRUIRE (coût + docs obligatoires)';
COMMENT ON COLUMN enlevement.destination_id IS 'Référence à la destination principale pour cet enlèvement (obligatoire si items A_DETRUIRE présents)';

