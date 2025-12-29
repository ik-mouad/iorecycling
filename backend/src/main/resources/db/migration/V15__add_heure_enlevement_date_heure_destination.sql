-- Migration V15 : Ajout de l'heure d'enlèvement et date/heure de destination
-- Permet de gérer les heures précises d'enlèvement et de destination

-- Ajout de l'heure d'enlèvement
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS heure_enlevement TIME;

-- Ajout de la date de destination
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS date_destination DATE;

-- Ajout de l'heure de destination
ALTER TABLE enlevement 
ADD COLUMN IF NOT EXISTS heure_destination TIME;

-- Commentaires
COMMENT ON COLUMN enlevement.heure_enlevement IS 'Heure de l''enlèvement';
COMMENT ON COLUMN enlevement.date_destination IS 'Date d''arrivée à la destination';
COMMENT ON COLUMN enlevement.heure_destination IS 'Heure d''arrivée à la destination';

