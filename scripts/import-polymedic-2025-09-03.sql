-- ============================================
-- Script d'importation - Enlèvement POLYMEDIC 03/09/2025
-- Type: VALORISABLE
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
    -- ENLÈVEMENT : 2025-09-03 - VALORISABLE
    -- ============================================
    v_enlevement_numero := 'ENL-2025-09-03-001';
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES (v_enlevement_numero, '2025-09-03', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Type VALORISABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO UPDATE SET date_enlevement = EXCLUDED.date_enlevement
    RETURNING id INTO v_enlevement_id;
    
    -- Créer la vente pour cet enlèvement
    v_vente_numero := 'VENTE-2025-09-03-001';
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES (v_vente_numero, '2025-09-03', 'Acheteur', 'Vente matériaux recyclables POLYMEDIC', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING
    RETURNING id INTO v_vente_id;
    
    -- Si la vente existe déjà, récupérer son ID
    IF v_vente_id IS NULL THEN
        SELECT id INTO v_vente_id FROM vente WHERE numero_vente = v_vente_numero;
    END IF;
    
    -- ============================================
    -- 1. Futs en carton - 145 unités
    -- Prix achat: 5, Prix vente: 10
    -- ============================================
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    VALUES (
        v_enlevement_id, 
        'RECYCLABLE', 
        'Futs en carton', 
        145, -- quantité
        5.0, -- prix unitaire (prix achat)
        725.0, -- montant = 145 * 5
        0, -- pas de prestation
        0,
        5.0, -- prix achat
        725.0, -- montant achat = 145 * 5
        145, -- reste à vendre
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_pickup_item_id;
    
    -- Créer la vente item
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (
            vente_id, pickup_item_id, type_dechet, sous_type, 
            quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at
        )
        VALUES (
            v_vente_id, 
            v_pickup_item_id, 
            'RECYCLABLE', 
            'Futs en carton', 
            145, -- quantité vendue
            10.0, -- prix vente unitaire
            1450.0, -- montant vente = 145 * 10
            CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_vente_item_id;
        
        -- Mettre à jour le pickup_item (quantité vendue)
        UPDATE pickup_item 
        SET quantite_vendue_kg = 145, reste_a_vendre_kg = 0 
        WHERE id = v_pickup_item_id;
        
        -- Créer la transaction (recette)
        INSERT INTO transaction (
            type, montant, date_transaction, description, categorie, 
            societe_id, enlevement_id, vente_item_id, type_recette, statut, 
            created_at, updated_at, created_by
        )
        VALUES (
            'RECETTE', 
            1450.0, -- CAF = quantité * prix vente
            '2025-09-03', 
            'Recette vente Futs en carton', 
            'VENTE_MATIERE',
            v_societe_id, 
            v_enlevement_id, 
            v_vente_item_id, 
            'VENTE_MATIERE', 
            'PAYEE', 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP, 
            'system'
        );
    END IF;
    
    -- ============================================
    -- 2. Palettes en bois - 6 unités
    -- Prix achat: 12, Prix vente: 17
    -- ============================================
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    VALUES (
        v_enlevement_id, 
        'RECYCLABLE', 
        'Palettes en bois', 
        6, -- quantité
        12.0, -- prix unitaire (prix achat)
        72.0, -- montant = 6 * 12
        0, -- pas de prestation
        0,
        12.0, -- prix achat
        72.0, -- montant achat = 6 * 12
        6, -- reste à vendre
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_pickup_item_id;
    
    -- Créer la vente item
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (
            vente_id, pickup_item_id, type_dechet, sous_type, 
            quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at
        )
        VALUES (
            v_vente_id, 
            v_pickup_item_id, 
            'RECYCLABLE', 
            'Palettes en bois', 
            6, -- quantité vendue
            17.0, -- prix vente unitaire
            102.0, -- montant vente = 6 * 17
            CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_vente_item_id;
        
        -- Mettre à jour le pickup_item
        UPDATE pickup_item 
        SET quantite_vendue_kg = 6, reste_a_vendre_kg = 0 
        WHERE id = v_pickup_item_id;
        
        -- Créer la transaction (recette)
        INSERT INTO transaction (
            type, montant, date_transaction, description, categorie, 
            societe_id, enlevement_id, vente_item_id, type_recette, statut, 
            created_at, updated_at, created_by
        )
        VALUES (
            'RECETTE', 
            102.0, -- CAF = 6 * 17
            '2025-09-03', 
            'Recette vente Palettes en bois', 
            'VENTE_MATIERE',
            v_societe_id, 
            v_enlevement_id, 
            v_vente_item_id, 
            'VENTE_MATIERE', 
            'PAYEE', 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP, 
            'system'
        );
    END IF;
    
    -- ============================================
    -- 3. Dechets bois - 250 kg
    -- Prix achat: 0.15, Prix vente: 0.3
    -- ============================================
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    VALUES (
        v_enlevement_id, 
        'RECYCLABLE', 
        'Dechets bois', 
        250, -- quantité en kg
        0.15, -- prix unitaire (prix achat) par kg
        37.5, -- montant = 250 * 0.15
        0, -- pas de prestation
        0,
        0.15, -- prix achat par kg
        37.5, -- montant achat = 250 * 0.15
        250, -- reste à vendre
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_pickup_item_id;
    
    -- Créer la vente item
    IF v_vente_id IS NOT NULL THEN
        INSERT INTO vente_item (
            vente_id, pickup_item_id, type_dechet, sous_type, 
            quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at
        )
        VALUES (
            v_vente_id, 
            v_pickup_item_id, 
            'RECYCLABLE', 
            'Dechets bois', 
            250, -- quantité vendue en kg
            0.3, -- prix vente unitaire par kg
            75.0, -- montant vente = 250 * 0.3
            CURRENT_TIMESTAMP
        )
        RETURNING id INTO v_vente_item_id;
        
        -- Mettre à jour le pickup_item
        UPDATE pickup_item 
        SET quantite_vendue_kg = 250, reste_a_vendre_kg = 0 
        WHERE id = v_pickup_item_id;
        
        -- Créer la transaction (recette)
        INSERT INTO transaction (
            type, montant, date_transaction, description, categorie, 
            societe_id, enlevement_id, vente_item_id, type_recette, statut, 
            created_at, updated_at, created_by
        )
        VALUES (
            'RECETTE', 
            75.0, -- CAF = 250 * 0.3
            '2025-09-03', 
            'Recette vente Dechets bois', 
            'VENTE_MATIERE',
            v_societe_id, 
            v_enlevement_id, 
            v_vente_item_id, 
            'VENTE_MATIERE', 
            'PAYEE', 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP, 
            'system'
        );
    END IF;
    
    RAISE NOTICE 'Enlèvement POLYMEDIC du 03/09/2025 créé avec succès';
    RAISE NOTICE 'Enlèvement ID: %, Vente ID: %', v_enlevement_id, v_vente_id;
END $$;

COMMIT;

-- Vérification
SELECT 
    'Enlèvement' AS type, 
    e.numero_enlevement, 
    e.date_enlevement::TEXT,
    COUNT(pi.id)::TEXT AS nb_items
FROM enlevement e
JOIN societe s ON s.id = e.societe_id
LEFT JOIN pickup_item pi ON pi.enlevement_id = e.id
WHERE s.raison_sociale = 'POLYMEDIC' 
AND e.date_enlevement = '2025-09-03'
GROUP BY e.id, e.numero_enlevement, e.date_enlevement
UNION ALL
SELECT 
    'Vente',
    v.numero_vente,
    v.date_vente::TEXT,
    COUNT(vi.id)::TEXT AS nb_items
FROM vente v
LEFT JOIN vente_item vi ON vi.vente_id = v.id
WHERE v.date_vente = '2025-09-03'
GROUP BY v.id, v.numero_vente, v.date_vente;

