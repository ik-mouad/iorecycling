-- ============================================
-- Script d'importation COMPLET des données POLYMEDIC
-- ============================================
-- Ce script crée la société POLYMEDIC et tous ses enlèvements et ventes
-- Les dates et types d'opération sont propagés (comme dans Excel)
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
    v_transaction_id BIGINT;
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
    -- ENLÈVEMENT 1 : 03/09/2025 - VALORISABLE
    -- ============================================
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES ('ENL-2025-09-03-001', '2025-09-03', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Futs en carton - 145 unités
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs en carton', 145, 5.0, 725.0, 0, 0, 5.0, 725.0, 145, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    
    -- Vente Futs en carton - CAF = 1450, PV = 10, Marge = 725
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2025-09-03-001', '2025-09-03', 'Acheteur Futs carton', 'Vente Futs en carton', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING
    RETURNING id INTO v_vente_id;
    
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs en carton', 145, 10.0, 1450.0, CURRENT_TIMESTAMP)
        RETURNING id INTO v_vente_item_id;
        
        UPDATE pickup_item SET quantite_vendue_kg = 145, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 1450.0, '2025-09-03', 'Recette vente Futs en carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 2 : 04/09/2024 - VALORISABLE
    -- ============================================
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES ('ENL-2024-09-04-001', '2024-09-04', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Carton piece - 550 unités
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Carton piece', 550, 0.7, 385.0, 0, 0, 0.7, 385.0, 550, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    
    -- Vente Carton piece - CAF = 1100, PV = 2, Marge = 715
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2024-09-04-001', '2024-09-04', 'Acheteur Carton', 'Vente Carton piece', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING
    RETURNING id INTO v_vente_id;
    
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Carton piece', 550, 2.0, 1100.0, CURRENT_TIMESTAMP)
        RETURNING id INTO v_vente_item_id;
        
        UPDATE pickup_item SET quantite_vendue_kg = 550, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 1100.0, '2024-09-04', 'Recette vente Carton piece', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 3 : 11/09/2025 - DECHETS (BANALS)
    -- ============================================
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES ('ENL-2025-09-11-001', '2025-09-11', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Déchets Banals - 1380 kg
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Déchets Banals', 1380, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- ============================================
    -- ENLÈVEMENT 4 : 16/09/2025 - DECHETS (BANALS)
    -- ============================================
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES ('ENL-2025-09-16-001', '2025-09-16', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Déchets Banals - 1550 kg
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Déchets Banals', 1550, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- ============================================
    -- ENLÈVEMENT 5 : 29/09/2025 - VALORISABLE
    -- ============================================
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES ('ENL-2025-09-29-001', '2025-09-29', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- CELLOPHANE - 38 kg
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'CELLOPHANE', 38, 1.5, 57.0, 0, 0, 1.5, 57.0, 38, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    
    -- Vente CELLOPHANE - CAF = 152, PV = 4, Marge = 95
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2025-09-29-001', '2025-09-29', 'Acheteur Cellophane', 'Vente CELLOPHANE', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING
    RETURNING id INTO v_vente_id;
    
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'CELLOPHANE', 38, 4.0, 152.0, CURRENT_TIMESTAMP)
        RETURNING id INTO v_vente_item_id;
        
        UPDATE pickup_item SET quantite_vendue_kg = 38, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 152.0, '2025-09-29', 'Recette vente CELLOPHANE', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    RAISE NOTICE 'Importation terminée pour POLYMEDIC';
END $$;

COMMIT;

-- Vérification
SELECT 
    'Société' AS type, COUNT(*) AS count FROM societe WHERE raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Enlèvements', COUNT(*) FROM enlevement e JOIN societe s ON s.id = e.societe_id WHERE s.raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Pickup Items', COUNT(*) FROM pickup_item pi JOIN enlevement e ON e.id = pi.enlevement_id JOIN societe s ON s.id = e.societe_id WHERE s.raison_sociale = 'POLYMEDIC'
UNION ALL
SELECT 'Ventes', COUNT(*) FROM vente
UNION ALL
SELECT 'Vente Items', COUNT(*) FROM vente_item
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transaction t JOIN societe s ON s.id = t.societe_id WHERE s.raison_sociale = 'POLYMEDIC';

