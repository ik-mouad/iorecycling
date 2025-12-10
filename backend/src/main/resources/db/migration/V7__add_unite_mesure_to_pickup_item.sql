-- Migration V7 : Ajout de l'unité de mesure aux items d'enlèvement
-- Permet de spécifier l'unité de mesure (kg, L, m³, unité, etc.) pour chaque déchet

-- Ajout de la colonne unite_mesure à la table pickup_item
ALTER TABLE pickup_item 
ADD COLUMN IF NOT EXISTS unite_mesure VARCHAR(20);

-- Mise à jour des valeurs existantes : par défaut "kg" pour les enregistrements existants
UPDATE pickup_item 
SET unite_mesure = 'kg' 
WHERE unite_mesure IS NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN pickup_item.unite_mesure IS 'Unité de mesure de la quantité : kg (kilogrammes), L (litres), m³ (mètres cubes), unité, etc.';

