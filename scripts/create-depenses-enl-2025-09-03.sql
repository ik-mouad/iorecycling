-- Créer les transactions DEPENSE manquantes pour l'enlèvement ENL-2025-09-03-001
DO $$
DECLARE
    v_enlevement_id BIGINT := 43;
    v_societe_id BIGINT;
    v_pickup_item RECORD;
    v_date_enlevement DATE;
BEGIN
    -- Récupérer l'ID de la société et la date
    SELECT societe_id, date_enlevement INTO v_societe_id, v_date_enlevement 
    FROM enlevement WHERE id = v_enlevement_id;
    
    IF v_societe_id IS NULL THEN
        RAISE EXCEPTION 'Enlèvement non trouvé';
    END IF;
    
    RAISE NOTICE 'Création des transactions DEPENSE pour l''enlèvement ID: %, Société ID: %', 
        v_enlevement_id, v_societe_id;
    
    -- Parcourir les pickup_items et créer les transactions DEPENSE
    FOR v_pickup_item IN 
        SELECT id, sous_type, montant_achat_mad, type_dechet
        FROM pickup_item
        WHERE enlevement_id = v_enlevement_id
        AND type_dechet = 'RECYCLABLE'
        AND montant_achat_mad IS NOT NULL
        AND montant_achat_mad > 0
        AND NOT EXISTS (
            SELECT 1 FROM transaction 
            WHERE enlevement_id = v_enlevement_id 
            AND type = 'DEPENSE'
            AND description LIKE '%' || sous_type || '%'
        )
    LOOP
        INSERT INTO transaction (
            type, montant, date_transaction, description, categorie,
            societe_id, enlevement_id, statut,
            created_at, updated_at, created_by
        )
        VALUES (
            'DEPENSE',
            v_pickup_item.montant_achat_mad,
            v_date_enlevement,
            E'Achat d\u00e9chets ' || v_pickup_item.sous_type || E' - Enl\u00e8vement ENL-2025-09-03-001',
            E'Achat d\u00e9chets valorisables',
            v_societe_id,
            v_enlevement_id,
            'EN_ATTENTE',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            'system'
        );
        
        RAISE NOTICE 'Transaction DEPENSE créée pour: % - Montant: %', 
            v_pickup_item.sous_type, v_pickup_item.montant_achat_mad;
    END LOOP;
    
    RAISE NOTICE 'Transactions DEPENSE créées avec succès';
END $$;

-- Vérification
SELECT 
    id,
    type,
    description,
    montant,
    statut,
    date_transaction
FROM transaction 
WHERE enlevement_id = 43 
ORDER BY type, id;

