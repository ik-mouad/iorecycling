-- Migration V16 : Module de comptabilité interne
-- Transaction, Paiement, Echeance

-- ============================================
-- 1. TABLE TRANSACTION (Recettes et dépenses)
-- ============================================
CREATE TABLE IF NOT EXISTS transaction (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('RECETTE', 'DEPENSE')),
    montant DECIMAL(15, 2) NOT NULL CHECK (montant > 0),
    date_transaction DATE NOT NULL,
    description VARCHAR(500) NOT NULL,
    categorie VARCHAR(100),
    numero_reference VARCHAR(50),
    societe_id BIGINT NOT NULL,
    enlevement_id BIGINT,
    notes TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'ANNULEE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    FOREIGN KEY (societe_id) REFERENCES societe(id) ON DELETE CASCADE,
    FOREIGN KEY (enlevement_id) REFERENCES enlevement(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transaction_societe ON transaction(societe_id);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON transaction(date_transaction);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON transaction(type);
CREATE INDEX IF NOT EXISTS idx_transaction_statut ON transaction(statut);
CREATE INDEX IF NOT EXISTS idx_transaction_enlevement ON transaction(enlevement_id);

-- ============================================
-- 2. TABLE PAIEMENT (Paiements reçus/effectués)
-- ============================================
CREATE TABLE IF NOT EXISTS paiement (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    montant DECIMAL(15, 2) NOT NULL CHECK (montant > 0),
    date_paiement DATE NOT NULL,
    mode_paiement VARCHAR(30) NOT NULL CHECK (mode_paiement IN ('ESPECES', 'CHEQUE', 'VIREMENT', 'CARTE_BANCAIRE', 'AUTRE')),
    reference VARCHAR(100),
    notes TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'VALIDE' CHECK (statut IN ('VALIDE', 'ANNULE', 'REMBOURSE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_paiement_transaction ON paiement(transaction_id);
CREATE INDEX IF NOT EXISTS idx_paiement_date ON paiement(date_paiement);
CREATE INDEX IF NOT EXISTS idx_paiement_statut ON paiement(statut);

-- ============================================
-- 3. TABLE ECHEANCE (Échéances de paiement)
-- ============================================
CREATE TABLE IF NOT EXISTS echeance (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    montant DECIMAL(15, 2) NOT NULL CHECK (montant > 0),
    date_echeance DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'PAYEE', 'IMPAYEE', 'ANNULEE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_echeance_transaction ON echeance(transaction_id);
CREATE INDEX IF NOT EXISTS idx_echeance_date ON echeance(date_echeance);
CREATE INDEX IF NOT EXISTS idx_echeance_statut ON echeance(statut);

