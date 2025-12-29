-- ============================================
-- Script de nettoyage de toutes les données fonctionnelles
-- ============================================
-- Ce script supprime toutes les données fonctionnelles de l'application
-- en respectant l'ordre des dépendances (clés étrangères)
--
-- ATTENTION : Cette opération est IRREVERSIBLE !
-- ============================================

BEGIN;

-- Désactiver temporairement les contraintes de clés étrangères pour faciliter la suppression
SET session_replication_role = 'replica';

-- ============================================
-- 1. SUPPRESSION DES PAIEMENTS ET ÉCHÉANCES
-- ============================================
-- Ces tables dépendent de Transaction
DELETE FROM paiement;
DELETE FROM echeance;

-- ============================================
-- 2. SUPPRESSION DES TRANSACTIONS
-- ============================================
-- Les transactions dépendent de Societe, Enlevement, VenteItem
DELETE FROM transaction;

-- ============================================
-- 3. SUPPRESSION DES VENTE_ITEM
-- ============================================
-- Les vente_item dépendent de Vente et PickupItem
DELETE FROM vente_item;

-- ============================================
-- 4. SUPPRESSION DES VENTES
-- ============================================
-- Les ventes dépendent de Societe (acheteur_id peut être NULL)
DELETE FROM vente;

-- ============================================
-- 5. SUPPRESSION DES PICKUP_ITEM
-- ============================================
-- Les pickup_item dépendent de Enlevement
DELETE FROM pickup_item;

-- ============================================
-- 6. SUPPRESSION DES DOCUMENTS
-- ============================================
-- Les documents dépendent de Enlevement et Societe
DELETE FROM document;

-- ============================================
-- 7. SUPPRESSION DES PLANNING_ENLEVEMENT
-- ============================================
-- Les planning_enlevement dépendent de Site, Societe, Recurrence, Enlevement
DELETE FROM planning_enlevement;

-- ============================================
-- 8. SUPPRESSION DES ENLÈVEMENTS
-- ============================================
-- Les enlèvements dépendent de Site, Societe, Camion, Destination
DELETE FROM enlevement;

-- ============================================
-- 9. SUPPRESSION DES DEMANDES D'ENLÈVEMENT
-- ============================================
-- Les demandes dépendent de Site et Societe
DELETE FROM demande_enlevement;

-- ============================================
-- 10. SUPPRESSION DES RÉCURRENCES
-- ============================================
-- Les récurrences dépendent de Societe et Site
DELETE FROM recurrence;

-- ============================================
-- 11. SUPPRESSION DES SITES
-- ============================================
-- Les sites dépendent de Societe
DELETE FROM site;

-- ============================================
-- 12. SUPPRESSION DES UTILISATEURS CLIENTS
-- ============================================
-- Les utilisateurs clients dépendent de Societe
DELETE FROM client_user;

-- ============================================
-- 13. SUPPRESSION DES SOCIÉTÉS
-- ============================================
-- Les sociétés sont à la racine de la hiérarchie
DELETE FROM societe;

-- ============================================
-- RÉACTIVER LES CONTRAINTES
-- ============================================
SET session_replication_role = 'origin';

COMMIT;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Afficher le nombre de lignes restantes dans chaque table
SELECT 
    'paiement' AS table_name, COUNT(*) AS remaining_rows FROM paiement
UNION ALL
SELECT 'echeance', COUNT(*) FROM echeance
UNION ALL
SELECT 'transaction', COUNT(*) FROM transaction
UNION ALL
SELECT 'vente_item', COUNT(*) FROM vente_item
UNION ALL
SELECT 'vente', COUNT(*) FROM vente
UNION ALL
SELECT 'pickup_item', COUNT(*) FROM pickup_item
UNION ALL
SELECT 'document', COUNT(*) FROM document
UNION ALL
SELECT 'planning_enlevement', COUNT(*) FROM planning_enlevement
UNION ALL
SELECT 'enlevement', COUNT(*) FROM enlevement
UNION ALL
SELECT 'demande_enlevement', COUNT(*) FROM demande_enlevement
UNION ALL
SELECT 'recurrence', COUNT(*) FROM recurrence
UNION ALL
SELECT 'site', COUNT(*) FROM site
UNION ALL
SELECT 'client_user', COUNT(*) FROM client_user
UNION ALL
SELECT 'societe', COUNT(*) FROM societe
ORDER BY table_name;

