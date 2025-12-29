-- ============================================
-- Script d'importation POLYMEDIC avec données en tableau
-- ============================================
-- Modifiez le tableau ci-dessous avec toutes vos données
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
    v_vente_numero VARCHAR(50);
    v_counter INTEGER;
    
    -- Tableau de données : Date, Type opération, Type déchet, Unité, Quantité, Prix, PV, CAF, MARGE
    -- MODIFIEZ CE TABLEAU AVEC VOS DONNÉES
    TYPE data_row IS RECORD (
        date_val DATE,
        type_op VARCHAR(50),
        type_dechet VARCHAR(100),
        unite VARCHAR(20),
        quantite DECIMAL(10,3),
        prix DECIMAL(10,3),
        pv DECIMAL(10,3),
        caf DECIMAL(12,2),
        marge DECIMAL(12,2)
    );
    
    data_array data_row[];
    current_row data_row;
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
    -- TABLEAU DE DONNÉES - MODIFIEZ ICI
    -- ============================================
    -- Format: (date, type_op, type_dechet, unite, quantite, prix, pv, caf, marge)
    data_array := ARRAY[
        -- Exemple - REMPLACEZ PAR VOS DONNÉES
        ('2025-09-03'::DATE, 'VALORISABLE', 'Futs en carton', 'Unité', 145, 5.0, 10.0, 1450.0, 725.0),
        ('2024-09-04'::DATE, 'VALORISABLE', 'Carton piece', 'Unité', 550, 0.7, 2.0, 1100.0, 715.0),
        ('2025-09-11'::DATE, 'DECHETS', 'Déchets Banals', 'Kg', 1380, 0, 0, 0, 0),
        ('2025-09-16'::DATE, 'DECHETS', 'Déchets Banals', 'Kg', 1550, 0, 0, 0, 0),
        ('2025-09-29'::DATE, 'VALORISABLE', 'CELLOPHANE', 'Kg', 38, 1.5, 4.0, 152.0, 95.0)
        -- AJOUTEZ TOUTES VOS AUTRES LIGNES ICI
    ];
    
    -- Traitement de chaque ligne
    v_current_date := NULL;
    v_current_type := NULL;
    v_counter := 0;
    
    FOREACH current_row IN ARRAY data_array
    LOOP
        -- Propagation des dates et types (comme Excel)
        IF current_row.date_val IS NOT NULL THEN
            v_current_date := current_row.date_val;
        END IF;
        
        IF current_row.type_op IS NOT NULL AND current_row.type_op != '' THEN
            v_current_type := current_row.type_op;
        END IF;
        
        -- Créer l'enlèvement si la date a changé
        IF v_current_date IS NOT NULL THEN
            v_counter := v_counter + 1;
            v_enlevement_numero := 'ENL-' || TO_CHAR(v_current_date, 'YYYY-MM-DD') || '-' || LPAD(v_counter::TEXT, 3, '0');
            
            INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
            VALUES (v_enlevement_numero, v_current_date, v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - ' || current_row.type_dechet, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
            ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
            RETURNING id INTO v_enlevement_id;
        END IF;
        
        -- Déterminer le type de déchet pour la base de données
        DECLARE
            v_db_type_dechet VARCHAR(20);
        BEGIN
            IF v_current_type = 'VALORISABLE' THEN
                v_db_type_dechet := 'RECYCLABLE';
            ELSIF v_current_type = 'DECHETS' OR current_row.type_dechet LIKE '%Banals%' THEN
                v_db_type_dechet := 'BANAL';
            ELSE
                v_db_type_dechet := 'RECYCLABLE'; -- Par défaut
            END IF;
            
            -- Créer le pickup_item
            INSERT INTO pickup_item (
                enlevement_id, type_dechet, sous_type, quantite_kg, 
                prix_unitaire_mad, montant_mad,
                prix_prestation_mad, montant_prestation_mad,
                prix_achat_mad, montant_achat_mad,
                prix_traitement_mad, montant_traitement_mad,
                reste_a_vendre_kg, created_at
            )
            VALUES (
                v_enlevement_id, 
                v_db_type_dechet, 
                current_row.type_dechet, 
                current_row.quantite,
                current_row.prix, 
                current_row.prix * current_row.quantite,
                CASE WHEN v_db_type_dechet = 'BANAL' THEN 0 ELSE 0 END, -- Prestation
                CASE WHEN v_db_type_dechet = 'BANAL' THEN 0 ELSE 0 END,
                CASE WHEN v_db_type_dechet = 'RECYCLABLE' THEN current_row.prix ELSE 0 END, -- Prix achat
                CASE WHEN v_db_type_dechet = 'RECYCLABLE' THEN current_row.prix * current_row.quantite ELSE 0 END,
                CASE WHEN v_db_type_dechet = 'BANAL' THEN 0 ELSE 0 END, -- Prix traitement
                CASE WHEN v_db_type_dechet = 'BANAL' THEN 0 ELSE 0 END,
                CASE WHEN v_current_type = 'VALORISABLE' THEN current_row.quantite ELSE 0 END, -- Reste à vendre
                CURRENT_TIMESTAMP
            )
            RETURNING id INTO v_pickup_item_id;
            
            -- Si VALORISABLE et CAF > 0, créer la vente
            IF v_current_type = 'VALORISABLE' AND current_row.caf > 0 THEN
                v_vente_numero := 'VENTE-' || TO_CHAR(v_current_date, 'YYYY-MM-DD') || '-' || LPAD(v_counter::TEXT, 3, '0');
                
                INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
                VALUES (v_vente_numero, v_current_date, 'Acheteur', 'Vente ' || current_row.type_dechet, 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
                ON CONFLICT (numero_vente) DO NOTHING
                RETURNING id INTO v_vente_id;
                
                IF v_vente_id IS NOT NULL THEN
                    INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
                    VALUES (v_vente_id, v_pickup_item_id, v_db_type_dechet, current_row.type_dechet, current_row.quantite, current_row.pv, current_row.caf, CURRENT_TIMESTAMP)
                    RETURNING id INTO v_vente_item_id;
                    
                    UPDATE pickup_item SET quantite_vendue_kg = current_row.quantite, reste_a_vendre_kg = 0 WHERE id = v_pickup_item_id;
                    
                    INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
                    VALUES ('RECETTE', current_row.caf, v_current_date, 'Recette vente ' || current_row.type_dechet, 'VENTE_MATIERE', v_societe_id, v_enlevement_id, v_vente_item_id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
                END IF;
            END IF;
        END;
    END LOOP;
    
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

