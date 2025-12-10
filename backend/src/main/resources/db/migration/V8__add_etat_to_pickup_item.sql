-- Migration V8 : Ajout de l'état aux items d'enlèvement
-- Permet de spécifier l'état du déchet : vrac, compacté, broyé, Palettisé, autre

-- Ajout de la colonne etat à la table pickup_item
ALTER TABLE pickup_item 
ADD COLUMN IF NOT EXISTS etat VARCHAR(20);

-- Commentaire sur la colonne
COMMENT ON COLUMN pickup_item.etat IS 'État du déchet : vrac, compacté, broyé, Palettisé, autre';

