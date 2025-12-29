-- ============================================
-- Script d'importation COMPLET des données POLYMEDIC
-- ============================================
-- Données fournies au format JSON
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
    v_enlevement_numero VARCHAR(50);
    v_vente_numero VARCHAR(50);
    v_counter INTEGER := 0;
    v_caf DECIMAL(12,2);
    v_marge DECIMAL(12,2);
    v_montant_achat DECIMAL(12,2);
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
    -- ENLÈVEMENT 1 : 2025-09-03
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-03-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-03', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Futs en carton
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs en carton', 145, 5.0, 725.0, 0, 0, 5.0, 725.0, 145, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    v_vente_numero := 'VENTE-2025-09-03-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-03', 'Acheteur', 'Vente Futs en carton', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs en carton', 145, 10.0, 1450.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 145, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 1450.0, '2025-09-03', 'Recette vente Futs en carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Palettes en bois
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Palettes en bois', 6, 12.0, 72.0, 0, 0, 12.0, 72.0, 6, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Palettes en bois', 6, 17.0, 102.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 6, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 102.0, '2025-09-03', 'Recette vente Palettes en bois', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Dechets bois
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Dechets bois', 250, 0.15, 37.5, 0, 0, 0.15, 37.5, 250, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Dechets bois', 250, 0.3, 75.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 250, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 75.0, '2025-09-03', 'Recette vente Dechets bois', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 2 : 2025-09-04
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-04-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-04', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Carton dechet
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Carton dechet', 370, 0.2, 74.0, 0, 0, 0.2, 74.0, 370, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    v_vente_numero := 'VENTE-2025-09-04-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-04', 'Acheteur', 'Vente Carton dechet', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Carton dechet', 370, 0.65, 240.5, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 370, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 240.5, '2025-09-04', 'Recette vente Carton dechet', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs en carton
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs en carton', 2, 5.0, 10.0, 0, 0, 5.0, 10.0, 2, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs en carton', 2, 10.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 2, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-04', 'Recette vente Futs en carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique M
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique M', 5, 20.0, 100.0, 0, 0, 20.0, 100.0, 5, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique M', 5, 40.0, 200.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 5, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 200.0, '2025-09-04', 'Recette vente Fut plastique M', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique P
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique P', 1, 10.0, 10.0, 0, 0, 10.0, 10.0, 1, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique P', 1, 20.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 1, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-04', 'Recette vente Fut plastique P', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Bideaux plastique
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Bideaux plastique', 4, 4.0, 16.0, 0, 0, 4.0, 16.0, 4, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NULL THEN SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero; END IF;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Bideaux plastique', 4, 5.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 4, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-04', 'Recette vente Bideaux plastique', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 3 : 2025-09-11 - DECHETS BANALS
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-11-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-11', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Dechets Banals', 1380, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- ============================================
    -- ENLÈVEMENT 4 : 2025-09-16
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-16-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-16', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    v_vente_numero := 'VENTE-2025-09-16-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-16', 'Acheteur', 'Vente matériaux recyclables', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    
    -- Fut métalique grand
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut métalique grand', 13, 35.0, 455.0, 0, 0, 35.0, 455.0, 13, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut métalique grand', 13, 60.0, 780.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 13, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 780.0, '2025-09-16', 'Recette vente Fut métalique grand', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut métalique petit
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut métalique petit', 1, 10.0, 10.0, 0, 0, 10.0, 10.0, 1, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut métalique petit', 1, 20.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 1, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-16', 'Recette vente Fut métalique petit', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique Grand 100 L
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique Grand 100 L', 6, 40.0, 240.0, 0, 0, 40.0, 240.0, 6, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique Grand 100 L', 6, 60.0, 360.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 6, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 360.0, '2025-09-16', 'Recette vente Fut plastique Grand 100 L', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique Moyen
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique Moyen', 9, 20.0, 180.0, 0, 0, 20.0, 180.0, 9, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique Moyen', 9, 40.0, 360.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 9, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 360.0, '2025-09-16', 'Recette vente Fut plastique Moyen', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique Petit
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique Petit', 1, 10.0, 10.0, 0, 0, 10.0, 10.0, 1, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique Petit', 1, 20.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 1, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-16', 'Recette vente Fut plastique Petit', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Bidon
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Bidon', 13, 4.0, 52.0, 0, 0, 4.0, 52.0, 13, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Bidon', 13, 5.0, 65.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 13, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 65.0, '2025-09-16', 'Recette vente Bidon', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut carton
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut carton', 23, 5.0, 115.0, 0, 0, 5.0, 115.0, 23, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut carton', 23, 10.0, 230.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 23, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 230.0, '2025-09-16', 'Recette vente Fut carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Dechets Banals
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Dechets Banals', 1550, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- ============================================
    -- ENLÈVEMENT 5 : 2025-09-18
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-18-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-18', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    v_vente_numero := 'VENTE-2025-09-18-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-18', 'Acheteur', 'Vente matériaux recyclables', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    
    -- Dechets Banals
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Dechets Banals', 620, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- Dechets palettes
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Dechets palettes', 560, 0.3, 168.0, 0, 0, 0.3, 168.0, 560, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Dechets palettes', 560, 0.5, 280.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 560, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 280.0, '2025-09-18', 'Recette vente Dechets palettes', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut métalique grand
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut métalique grand', 2, 35.0, 70.0, 0, 0, 35.0, 70.0, 2, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut métalique grand', 2, 60.0, 120.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 2, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 120.0, '2025-09-18', 'Recette vente Fut métalique grand', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique M
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique M', 2, 20.0, 40.0, 0, 0, 20.0, 40.0, 2, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique M', 2, 40.0, 80.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 2, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 80.0, '2025-09-18', 'Recette vente Fut plastique M', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut plastique P
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut plastique P', 1, 10.0, 10.0, 0, 0, 10.0, 10.0, 1, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut plastique P', 1, 20.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 1, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-18', 'Recette vente Fut plastique P', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Palette 1x1.2
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Palette 1x1.2', 12, 12.0, 144.0, 0, 0, 12.0, 144.0, 12, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Palette 1x1.2', 12, 17.0, 204.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 12, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 204.0, '2025-09-18', 'Recette vente Palette 1x1.2', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs carton
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs carton', 22, 5.0, 110.0, 0, 0, 5.0, 110.0, 22, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs carton', 22, 10.0, 220.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 22, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 220.0, '2025-09-18', 'Recette vente Futs carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 6 : 2025-09-22
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-22-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-22', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    v_vente_numero := 'VENTE-2025-09-22-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-22', 'Acheteur', 'Vente matériaux recyclables', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    
    -- Cartons pieces
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Cartons pieces', 520, 0.7, 364.0, 0, 0, 0.7, 364.0, 520, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Cartons pieces', 520, 2.0, 1040.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 520, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 1040.0, '2025-09-22', 'Recette vente Cartons pieces', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Dechets cartons
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Dechets cartons', 370, 0.2, 74.0, 0, 0, 0.2, 74.0, 370, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Dechets cartons', 370, 0.65, 240.5, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 370, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 240.5, '2025-09-22', 'Recette vente Dechets cartons', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Fut métalique grand
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Fut métalique grand', 11, 35.0, 385.0, 0, 0, 35.0, 385.0, 11, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Fut métalique grand', 11, 60.0, 660.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 11, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 660.0, '2025-09-22', 'Recette vente Fut métalique grand', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- ============================================
    -- ENLÈVEMENT 7 : 2025-09-25 - DECHETS BANALS
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-25-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-25', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_traitement_mad, montant_traitement_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'BANAL', 'Dechets Banals', 1280, 0, 0, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP);
    
    -- ============================================
    -- ENLÈVEMENT 8 : 2025-09-29
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-29-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-29', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    v_vente_numero := 'VENTE-2025-09-29-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-29', 'Acheteur', 'Vente matériaux recyclables', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING RETURNING id INTO v_vente_id;
    
    -- Cellophane
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Cellophane', 38, 1.5, 57.0, 0, 0, 1.5, 57.0, 38, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Cellophane', 38, 4.0, 152.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 38, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 152.0, '2025-09-29', 'Recette vente Cellophane', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Inox
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Inox', 23.4, 5.0, 117.0, 0, 0, 5.0, 117.0, 23.4, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Inox', 23.4, 8.0, 187.2, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 23.4, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 187.2, '2025-09-29', 'Recette vente Inox', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Mandrin de cellophane
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Mandrin de cellophane', 52, 0.5, 26.0, 0, 0, 0.5, 26.0, 52, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Mandrin de cellophane', 52, 1.0, 52.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 52, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 52.0, '2025-09-29', 'Recette vente Mandrin de cellophane', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs métalique grand
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs métalique grand', 10, 35.0, 350.0, 0, 0, 35.0, 350.0, 10, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs métalique grand', 10, 60.0, 600.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 10, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 600.0, '2025-09-29', 'Recette vente Futs métalique grand', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs métalique petit
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs métalique petit', 1, 10.0, 10.0, 0, 0, 10.0, 10.0, 1, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs métalique petit', 1, 20.0, 20.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 1, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 20.0, '2025-09-29', 'Recette vente Futs métalique petit', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs carton
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs carton', 42, 5.0, 210.0, 0, 0, 5.0, 210.0, 42, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs carton', 42, 10.0, 420.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 42, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 420.0, '2025-09-29', 'Recette vente Futs carton', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Futs plastique petit
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Futs plastique petit', 5, 4.0, 20.0, 0, 0, 4.0, 20.0, 5, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Futs plastique petit', 5, 5.0, 25.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 5, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 25.0, '2025-09-29', 'Recette vente Futs plastique petit', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    -- Carton piece
    INSERT INTO pickup_item (enlevement_id, type_dechet, sous_type, quantite_kg, prix_unitaire_mad, montant_mad, prix_prestation_mad, montant_prestation_mad, prix_achat_mad, montant_achat_mad, reste_a_vendre_kg, created_at)
    VALUES (v_enlevement_id, 'RECYCLABLE', 'Carton piece', 370, 0.7, 259.0, 0, 0, 0.7, 259.0, 370, CURRENT_TIMESTAMP)
    RETURNING id INTO v_pickup_item_id;
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
        VALUES (v_vente_id, v_pickup_item_id, 'RECYCLABLE', 'Carton piece', 370, 2.0, 740.0, CURRENT_TIMESTAMP) RETURNING id INTO v_vente_item_id;
        UPDATE pickup_item SET quantite_vendue_kg = 370, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
        INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
        VALUES ('RECETTE', 740.0, '2025-09-29', 'Recette vente Carton piece', 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
    END IF;
    
    RAISE NOTICE 'Importation terminée pour POLYMEDIC - Toutes les données ont été importées';
END $$;

COMMIT;

-- Vérification finale
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

