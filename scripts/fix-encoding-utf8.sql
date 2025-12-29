-- Corriger l'encodage UTF-8 des transactions
-- Utiliser la fonction convert_from avec l'encodage UTF-8 explicite

-- Méthode 1: Utiliser des caractères Unicode directement
UPDATE transaction 
SET description = E'Achat d\u00e9chets Futs en carton - Enl\u00e8vement ENL-2025-09-03-001'
WHERE id = 47;

UPDATE transaction 
SET description = E'Achat d\u00e9chets Palettes en bois - Enl\u00e8vement ENL-2025-09-03-001'
WHERE id = 48;

UPDATE transaction 
SET description = E'Achat d\u00e9chets Dechets bois - Enl\u00e8vement ENL-2025-09-03-001'
WHERE id = 49;

-- Corriger la catégorie
UPDATE transaction 
SET categorie = E'Achat d\u00e9chets valorisables'
WHERE id IN (47, 48, 49);

-- Vérification
SELECT id, description, categorie 
FROM transaction 
WHERE id IN (47, 48, 49)
ORDER BY id;

