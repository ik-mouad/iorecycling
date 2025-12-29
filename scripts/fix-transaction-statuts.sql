-- Script pour corriger les statuts des transactions basés sur les paiements réels
-- Ce script recalcule le statut de toutes les transactions en fonction des paiements valides

-- Mettre à jour les statuts des transactions
UPDATE transaction t
SET statut = CASE
    -- Si aucun paiement valide ou montant payé = 0
    WHEN COALESCE((
        SELECT SUM(p.montant) 
        FROM paiement p 
        WHERE p.transaction_id = t.id 
        AND p.statut = 'VALIDE'
    ), 0) = 0 THEN 'EN_ATTENTE'
    
    -- Si montant payé >= montant total
    WHEN COALESCE((
        SELECT SUM(p.montant) 
        FROM paiement p 
        WHERE p.transaction_id = t.id 
        AND p.statut = 'VALIDE'
    ), 0) >= t.montant THEN 'PAYEE'
    
    -- Si montant payé < montant total mais > 0
    ELSE 'PARTIELLEMENT_PAYEE'
END
WHERE t.statut != 'ANNULEE';

-- Afficher un résumé des corrections
SELECT 
    statut,
    COUNT(*) as nombre_transactions,
    SUM(montant) as total_montant
FROM transaction
GROUP BY statut
ORDER BY statut;

