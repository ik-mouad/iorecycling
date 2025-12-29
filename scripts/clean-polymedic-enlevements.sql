-- ============================================
-- Script de suppression de tous les enlèvements POLYMEDIC
-- ============================================
-- Ce script supprime tous les enlèvements de POLYMEDIC et toutes les données associées
-- ATTENTION : Cette opération est IRREVERSIBLE !
-- ============================================

BEGIN;

DO $$
DECLARE
    v_societe_id BIGINT;
    v_count_paiements INTEGER;
    v_count_echeances INTEGER;
    v_count_transactions INTEGER;
    v_count_vente_items INTEGER;
    v_count_ventes INTEGER;
    v_count_pickup_items INTEGER;
    v_count_enlevements INTEGER;
BEGIN
    -- Récupérer l'ID de la société POLYMEDIC
    SELECT id INTO v_societe_id FROM societe WHERE raison_sociale = 'POLYMEDIC';
    
    IF v_societe_id IS NULL THEN
        RAISE NOTICE 'Société POLYMEDIC non trouvée';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Suppression des enlèvements de POLYMEDIC (ID: %)', v_societe_id;
    
    -- 1. Supprimer les paiements liés aux transactions des enlèvements POLYMEDIC
    DELETE FROM paiement
    WHERE transaction_id IN (
        SELECT t.id FROM transaction t
        JOIN enlevement e ON e.id = t.enlevement_id
        WHERE e.societe_id = v_societe_id
    );
    GET DIAGNOSTICS v_count_paiements = ROW_COUNT;
    RAISE NOTICE 'Paiements supprimés: %', v_count_paiements;
    
    -- 2. Supprimer les échéances liées aux transactions des enlèvements POLYMEDIC
    DELETE FROM echeance
    WHERE transaction_id IN (
        SELECT t.id FROM transaction t
        JOIN enlevement e ON e.id = t.enlevement_id
        WHERE e.societe_id = v_societe_id
    );
    GET DIAGNOSTICS v_count_echeances = ROW_COUNT;
    RAISE NOTICE 'Échéances supprimées: %', v_count_echeances;
    
    -- 3. Supprimer les transactions liées aux enlèvements POLYMEDIC
    DELETE FROM transaction
    WHERE enlevement_id IN (
        SELECT id FROM enlevement WHERE societe_id = v_societe_id
    );
    GET DIAGNOSTICS v_count_transactions = ROW_COUNT;
    RAISE NOTICE 'Transactions supprimées: %', v_count_transactions;
    
    -- 4. Supprimer les vente_items liés aux pickup_items des enlèvements POLYMEDIC
    DELETE FROM vente_item
    WHERE pickup_item_id IN (
        SELECT pi.id FROM pickup_item pi
        JOIN enlevement e ON e.id = pi.enlevement_id
        WHERE e.societe_id = v_societe_id
    );
    GET DIAGNOSTICS v_count_vente_items = ROW_COUNT;
    RAISE NOTICE 'Vente items supprimés: %', v_count_vente_items;
    
    -- 5. Supprimer les ventes qui n'ont plus de vente_items
    DELETE FROM vente
    WHERE id NOT IN (SELECT DISTINCT vente_id FROM vente_item WHERE vente_id IS NOT NULL);
    GET DIAGNOSTICS v_count_ventes = ROW_COUNT;
    RAISE NOTICE 'Ventes supprimées: %', v_count_ventes;
    
    -- 6. Supprimer les pickup_items des enlèvements POLYMEDIC
    DELETE FROM pickup_item
    WHERE enlevement_id IN (
        SELECT id FROM enlevement WHERE societe_id = v_societe_id
    );
    GET DIAGNOSTICS v_count_pickup_items = ROW_COUNT;
    RAISE NOTICE 'Pickup items supprimés: %', v_count_pickup_items;
    
    -- 7. Supprimer les documents liés aux enlèvements POLYMEDIC
    DELETE FROM document
    WHERE enlevement_id IN (
        SELECT id FROM enlevement WHERE societe_id = v_societe_id
    );
    
    -- 8. Supprimer les planning_enlevement liés aux enlèvements POLYMEDIC
    DELETE FROM planning_enlevement
    WHERE enlevement_id IN (
        SELECT id FROM enlevement WHERE societe_id = v_societe_id
    );
    
    -- 9. Supprimer les enlèvements POLYMEDIC
    DELETE FROM enlevement
    WHERE societe_id = v_societe_id;
    GET DIAGNOSTICS v_count_enlevements = ROW_COUNT;
    RAISE NOTICE 'Enlèvements supprimés: %', v_count_enlevements;
    
    RAISE NOTICE 'Suppression terminée pour POLYMEDIC';
END $$;

COMMIT;

-- Vérification
SELECT 
    'Enlèvements POLYMEDIC' AS type, COUNT(*) AS count 
FROM enlevement e 
JOIN societe s ON s.id = e.societe_id 
WHERE s.raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Pickup Items POLYMEDIC', COUNT(*) 
FROM pickup_item pi 
JOIN enlevement e ON e.id = pi.enlevement_id 
JOIN societe s ON s.id = e.societe_id 
WHERE s.raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Transactions POLYMEDIC', COUNT(*) 
FROM transaction t 
JOIN enlevement e ON e.id = t.enlevement_id 
JOIN societe s ON s.id = e.societe_id 
WHERE s.raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Ventes (toutes)', COUNT(*) FROM vente
UNION ALL
SELECT 'Vente Items (tous)', COUNT(*) FROM vente_item;

