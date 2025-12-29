-- ============================================
-- Script d'importation des données POLYMEDIC
-- ============================================
-- Ce script crée la société POLYMEDIC et tous ses enlèvements et ventes
-- basé sur les données du tableau Excel fourni
-- ============================================

BEGIN;

-- ============================================
-- 1. CRÉATION DE LA SOCIÉTÉ POLYMEDIC
-- ============================================
INSERT INTO societe (raison_sociale, ice, email, telephone, commentaire, created_at, updated_at)
VALUES (
    'POLYMEDIC',
    '123456789012345', -- ICE (15 chiffres requis)
    'contact@polymedic.ma', -- Email obligatoire
    NULL,
    'Société POLYMEDIC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (ice) DO NOTHING;

-- Récupérer l'ID de la société créée
DO $$
DECLARE
    v_societe_id BIGINT;
    v_site_id BIGINT;
BEGIN
    -- Récupérer l'ID de POLYMEDIC
    SELECT id INTO v_societe_id FROM societe WHERE raison_sociale = 'POLYMEDIC';
    
    IF v_societe_id IS NULL THEN
        RAISE EXCEPTION 'Société POLYMEDIC non trouvée';
    END IF;
    
    -- Créer un site par défaut pour POLYMEDIC
    INSERT INTO site (societe_id, name, adresse, created_at, updated_at)
    VALUES (v_societe_id, 'Site Principal POLYMEDIC', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_site_id;
    
    IF v_site_id IS NULL THEN
        SELECT id INTO v_site_id FROM site WHERE societe_id = v_societe_id LIMIT 1;
    END IF;
    
    -- ============================================
    -- 2. CRÉATION DES ENLÈVEMENTS
    -- ============================================
    -- Enlèvement du 03/09/2025
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES 
        ('ENL-2025-09-03-001', '2025-09-03', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO NOTHING;
    
    -- Enlèvement du 04/09/2024
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES 
        ('ENL-2024-09-04-001', '2024-09-04', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO NOTHING;
    
    -- Enlèvement du 11/09/2025
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES 
        ('ENL-2025-09-11-001', '2025-09-11', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO NOTHING;
    
    -- Enlèvement du 16/09/2025
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES 
        ('ENL-2025-09-16-001', '2025-09-16', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC - Déchets Banals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO NOTHING;
    
    -- Enlèvement du 29/09/2025
    INSERT INTO enlevement (numero_enlevement, date_enlevement, site_id, societe_id, observation, created_at, updated_at, created_by)
    VALUES 
        ('ENL-2025-09-29-001', '2025-09-29', v_site_id, v_societe_id, 'Enlèvement POLYMEDIC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_enlevement) DO NOTHING;
    
    -- ============================================
    -- 3. CRÉATION DES PICKUP_ITEMS
    -- ============================================
    -- Note: Les données exactes du tableau doivent être complétées
    -- Je crée des exemples basés sur ce qui est visible dans l'image
    
    -- Enlèvement du 03/09/2025 - Futs en carton (RECYCLABLE)
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    SELECT 
        e.id, 'RECYCLABLE', 'Futs en carton', 145, -- 145 unités
        5.0, 725.0, -- Prix unitaire et total (coût d'achat)
        0, 0, -- Pas de prestation pour recyclable
        5.0, 725.0, -- Prix d'achat = 5 MAD/unité
        145, CURRENT_TIMESTAMP
    FROM enlevement e
    WHERE e.numero_enlevement = 'ENL-2025-09-03-001';
    
    -- Enlèvement du 04/09/2024 - Carton piece (RECYCLABLE)
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    SELECT 
        e.id, 'RECYCLABLE', 'Carton piece', 550, -- 550 unités
        0.7, 385.0, -- Prix unitaire et total (coût d'achat)
        0, 0, -- Pas de prestation
        0.7, 385.0, -- Prix d'achat = 0.7 MAD/unité
        550, CURRENT_TIMESTAMP
    FROM enlevement e
    WHERE e.numero_enlevement = 'ENL-2024-09-04-001';
    
    -- Enlèvement du 11/09/2025 - Déchets Banals
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_traitement_mad, montant_traitement_mad,
        reste_a_vendre_kg, created_at
    )
    SELECT 
        e.id, 'BANAL', 'Déchets Banals', 1380, -- 1380 kg
        0, 0, -- Pas de valeur
        0, 0, -- Pas de prestation
        0, 0, -- Coût de traitement (à définir)
        0, CURRENT_TIMESTAMP
    FROM enlevement e
    WHERE e.numero_enlevement = 'ENL-2025-09-11-001';
    
    -- Enlèvement du 16/09/2025 - Déchets Banals
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_traitement_mad, montant_traitement_mad,
        reste_a_vendre_kg, created_at
    )
    SELECT 
        e.id, 'BANAL', 'Déchets Banals', 1550, -- 1550 kg
        0, 0, -- Pas de valeur
        0, 0, -- Pas de prestation
        0, 0, -- Coût de traitement (à définir)
        0, CURRENT_TIMESTAMP
    FROM enlevement e
    WHERE e.numero_enlevement = 'ENL-2025-09-16-001';
    
    -- Enlèvement du 29/09/2025 - CELLOPHANE (RECYCLABLE)
    INSERT INTO pickup_item (
        enlevement_id, type_dechet, sous_type, quantite_kg, 
        prix_unitaire_mad, montant_mad,
        prix_prestation_mad, montant_prestation_mad,
        prix_achat_mad, montant_achat_mad,
        reste_a_vendre_kg, created_at
    )
    SELECT 
        e.id, 'RECYCLABLE', 'CELLOPHANE', 38, -- 38 kg
        1.5, 57.0, -- Prix unitaire et total (coût d'achat)
        0, 0, -- Pas de prestation
        1.5, 57.0, -- Prix d'achat = 1.5 MAD/kg
        38, CURRENT_TIMESTAMP
    FROM enlevement e
    WHERE e.numero_enlevement = 'ENL-2025-09-29-001';
    
    -- ============================================
    -- 4. CRÉATION DES VENTES (pour les valorisables)
    -- ============================================
    -- Vente du 03/09/2025 - Futs en carton
    -- CAF = 1450, PV = 10, Marge = 725
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2025-09-03-001', '2025-09-03', 'Acheteur Futs carton', 'Vente Futs en carton', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING;
    
    INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
    SELECT 
        v.id, pi.id, 'RECYCLABLE', 'Futs en carton', 145, 10.0, 1450.0, CURRENT_TIMESTAMP
    FROM vente v
    CROSS JOIN pickup_item pi
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2025-09-03-001'
    AND e.numero_enlevement = 'ENL-2025-09-03-001'
    AND pi.sous_type = 'Futs en carton'
    LIMIT 1;
    
    -- Mettre à jour la quantité vendue dans pickup_item
    UPDATE pickup_item pi
    SET quantite_vendue_kg = 145, reste_a_vendre_kg = 0
    FROM enlevement e
    WHERE pi.enlevement_id = e.id
    AND e.numero_enlevement = 'ENL-2025-09-03-001'
    AND pi.sous_type = 'Futs en carton';
    
    -- Vente du 04/09/2024 - Carton piece
    -- CAF = 1100, PV = 2, Marge = 715
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2024-09-04-001', '2024-09-04', 'Acheteur Carton', 'Vente Carton piece', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING;
    
    INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
    SELECT 
        v.id, pi.id, 'RECYCLABLE', 'Carton piece', 550, 2.0, 1100.0, CURRENT_TIMESTAMP
    FROM vente v
    CROSS JOIN pickup_item pi
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2024-09-04-001'
    AND e.numero_enlevement = 'ENL-2024-09-04-001'
    AND pi.sous_type = 'Carton piece'
    LIMIT 1;
    
    UPDATE pickup_item pi
    SET quantite_vendue_kg = 550, reste_a_vendre_kg = 0
    FROM enlevement e
    WHERE pi.enlevement_id = e.id
    AND e.numero_enlevement = 'ENL-2024-09-04-001'
    AND pi.sous_type = 'Carton piece';
    
    -- Vente du 29/09/2025 - CELLOPHANE
    -- CAF = 152, PV = 4, Marge = 95
    INSERT INTO vente (numero_vente, date_vente, acheteur_nom, observation, statut, created_at, updated_at, created_by)
    VALUES ('VENTE-2025-09-29-001', '2025-09-29', 'Acheteur Cellophane', 'Vente CELLOPHANE', 'VALIDEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system')
    ON CONFLICT (numero_vente) DO NOTHING;
    
    INSERT INTO vente_item (vente_id, pickup_item_id, type_dechet, sous_type, quantite_vendue_kg, prix_vente_unitaire_mad, montant_vente_mad, created_at)
    SELECT 
        v.id, pi.id, 'RECYCLABLE', 'CELLOPHANE', 38, 4.0, 152.0, CURRENT_TIMESTAMP
    FROM vente v
    CROSS JOIN pickup_item pi
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2025-09-29-001'
    AND e.numero_enlevement = 'ENL-2025-09-29-001'
    AND pi.sous_type = 'CELLOPHANE'
    LIMIT 1;
    
    UPDATE pickup_item pi
    SET quantite_vendue_kg = 38, reste_a_vendre_kg = 0
    FROM enlevement e
    WHERE pi.enlevement_id = e.id
    AND e.numero_enlevement = 'ENL-2025-09-29-001'
    AND pi.sous_type = 'CELLOPHANE';
    
    -- ============================================
    -- 5. CRÉATION DES TRANSACTIONS (Recettes)
    -- ============================================
    -- Transaction pour la vente Futs en carton (Recette VENTE_MATIERE)
    INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
    SELECT 
        'RECETTE', 1450.0, '2025-09-03', 'Recette vente Futs en carton', 'VENTE_MATIERE',
        v_societe_id, e.id, vi.id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'
    FROM vente v
    JOIN vente_item vi ON vi.vente_id = v.id
    JOIN pickup_item pi ON pi.id = vi.pickup_item_id
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2025-09-03-001'
    LIMIT 1;
    
    -- Transaction pour la vente Carton piece
    INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
    SELECT 
        'RECETTE', 1100.0, '2024-09-04', 'Recette vente Carton piece', 'VENTE_MATIERE',
        v_societe_id, e.id, vi.id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'
    FROM vente v
    JOIN vente_item vi ON vi.vente_id = v.id
    JOIN pickup_item pi ON pi.id = vi.pickup_item_id
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2024-09-04-001'
    LIMIT 1;
    
    -- Transaction pour la vente CELLOPHANE
    INSERT INTO transaction (type, montant, date_transaction, description, categorie, societe_id, enlevement_id, vente_item_id, type_recette, statut, created_at, updated_at, created_by)
    SELECT 
        'RECETTE', 152.0, '2025-09-29', 'Recette vente CELLOPHANE', 'VENTE_MATIERE',
        v_societe_id, e.id, vi.id, 'VENTE_MATIERE', 'PAYEE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'
    FROM vente v
    JOIN vente_item vi ON vi.vente_id = v.id
    JOIN pickup_item pi ON pi.id = vi.pickup_item_id
    JOIN enlevement e ON e.id = pi.enlevement_id
    WHERE v.numero_vente = 'VENTE-2025-09-29-001'
    LIMIT 1;
    
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

