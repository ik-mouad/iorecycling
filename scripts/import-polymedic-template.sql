-- ============================================
-- Template d'importation COMPLET des données POLYMEDIC
-- ============================================
-- Instructions :
-- 1. Pour chaque ligne du tableau Excel, ajoutez une section dans ce script
-- 2. Les dates et types d'opération sont propagés (comme dans Excel)
-- 3. Format : Date | Type opération | Type déchet | Unité | Quantité | Prix | PV | CAF | MARGE
-- ============================================

BEGIN;

DO $$
DECLARE
    v_societe_id BIGINT;
    v_site_id BIGINT;
    v_enlevement_id BIGINT;
    v_pickup_item_id BIGINT;
    v_vente_id BIGINT;
    v_vente_item_id BIGINT;
    v_current_date DATE;
    v_current_type VARCHAR(50);
    v_enlevement_numero VARCHAR(50);
BEGIN
    -- Récupérer ou créer la société POLYMEDIC
    SELECT id INTO v_societe_id FROM societe WHERE raison_sociale = 'POLYMEDIC';
    
    IF v_societe_id IS NULL THEN
        INSERT INTO societe (raison_sociale, ice, email, telephone, commentaire, created_at, updated_at)
        VALUES ('POLYMEDIC', '123456789012345', 'contact@polymedic.ma', NULL, 'Société POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id INTO v_societe_id;
    END IF;
    
    -- Créer un site par défaut
    SELECT id INTO v_site_id FROM site WHERE societe_id = v_societe_id LIMIT 1;
    
    IF v_site_id IS NULL THEN
        INSERT INTO site (societe_id, name, adresse, created_at, updated_at)
        VALUES (v_societe_id, 'Site Principal POLYMEDIC', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id INTO v_site_id;
    END IF;
    
    -- ============================================
    -- INSTRUCTIONS POUR AJOUTER UNE LIGNE :
    -- ============================================
    -- 1. Si la date change, créer un nouvel enlèvement
    -- 2. Si le type d'opération change, mettre à jour v_current_type
    -- 3. Pour VALORISABLE : créer pickup_item + vente + transaction
    -- 4. Pour DECHETS/BANALS : créer pickup_item seulement (pas de vente)
    -- ============================================
    
    -- EXEMPLE DE STRUCTURE :
    /*
    -- Date: 03/09/2025, Type: VALORISABLE
    v_current_date := '2025-09-03';
    v_current_type := 'VALORISABLE';
    v_enlevement_numero := 'ENL-2025-09-03-001';
    
    -- Créer l'enlèvement si nécessaire
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, v_current_date, v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Créer le pickup_item
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs en carton', 145, 5.0, 725.0, 0, 0, 5.0, 725.0, 145, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    
    -- Si VALORISABLE, créer la vente
    IF v_current_type = 'VALORISABLE' THEN
        INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
        VALUES ('VENTE-' || TO_CHAR(v_current_date, 'YYYY-MM-DD') || '-001', v_current_date, 'Acheteur', 'Vente ' || 'Futs en carton', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
        ON CONFLICT (numero_vente) DO NOTHING
        RETURNING id INTO v_vente_id;
        
        IF v_vente_id IS NOT NULL THEN
            INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
            VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs en carton', 145, 10.0, 1450.0, CURRENT_TIMESTAMP)
            RETURNING id INTO v_vente_item_id;
            
            UPDATE pickup_item SET quantite_vendue_kg = 145, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
            
            INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
            VALUES ('RECETTE', 1450.0, v_current_date, 'Recette vente Futs en carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
        END IF;
    END IF;
    */
    
    RAISE NOTICE 'Template prêt - Ajoutez vos données ici';
END $$;

COMMIT;

