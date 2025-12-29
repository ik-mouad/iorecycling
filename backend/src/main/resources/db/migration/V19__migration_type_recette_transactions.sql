-- Migration V19 : Mise à jour du type_recette pour les transactions existantes
-- 
-- Cette migration met à jour les transactions RECETTE existantes qui n'ont pas de type_recette
-- en leur attribuant le type PRESTATION (car elles proviennent d'enlèvements)

-- Mettre à jour les transactions RECETTE liées à un enlèvement avec type_recette = 'PRESTATION'
UPDATE transaction
SET type_recette = 'PRESTATION'
WHERE type = 'RECETTE'
  AND type_recette IS NULL
  AND enlevement_id IS NOT NULL;

-- Note: Les transactions RECETTE liées à une vente (vente_item_id) seront mises à jour
-- automatiquement lors de la création des ventes via VenteService

-- Log pour vérification
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM transaction
    WHERE type = 'RECETTE' AND type_recette = 'PRESTATION';
    
    RAISE NOTICE 'Nombre de transactions RECETTE mises à jour avec type_recette = PRESTATION: %', updated_count;
END $$;


