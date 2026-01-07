package ma.iorecycling.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour gérer les politiques Casbin dynamiquement
 * Permet d'ajouter, supprimer et modifier les permissions sans redémarrer l'application
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CasbinPolicyService {

    private final Enforcer enforcer;

    /**
     * Ajoute une politique
     * @param role Le rôle (ex: ADMIN, CLIENT, COMPTABLE)
     * @param resource La ressource (ex: enlevements, societes)
     * @param action L'action (ex: read, write)
     * @return true si la politique a été ajoutée avec succès
     */
    @Transactional
    public boolean addPolicy(String role, String resource, String action) {
        try {
            boolean added = enforcer.addPolicy(role, resource, action);
            if (added) {
                enforcer.savePolicy();
                log.info("Politique ajoutée: {} -> {}:{}", role, resource, action);
            }
            return added;
        } catch (Exception e) {
            log.error("Erreur lors de l'ajout de la politique: {} -> {}:{}", role, resource, action, e);
            return false;
        }
    }

    /**
     * Supprime une politique
     * @param role Le rôle
     * @param resource La ressource
     * @param action L'action
     * @return true si la politique a été supprimée avec succès
     */
    @Transactional
    public boolean removePolicy(String role, String resource, String action) {
        try {
            boolean removed = enforcer.removePolicy(role, resource, action);
            if (removed) {
                enforcer.savePolicy();
                log.info("Politique supprimée: {} -> {}:{}", role, resource, action);
            }
            return removed;
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de la politique: {} -> {}:{}", role, resource, action, e);
            return false;
        }
    }

    /**
     * Vérifie si une politique existe
     * @param role Le rôle
     * @param resource La ressource
     * @param action L'action
     * @return true si la politique existe
     */
    public boolean hasPolicy(String role, String resource, String action) {
        return enforcer.hasPolicy(role, resource, action);
    }

    /**
     * Récupère toutes les politiques pour un rôle donné
     * @param role Le rôle
     * @return Liste des politiques au format [resource, action]
     */
    public List<List<String>> getPoliciesForRole(String role) {
        return enforcer.getFilteredPolicy(0, role);
    }

    /**
     * Récupère toutes les politiques
     * @return Liste de toutes les politiques
     */
    public List<List<String>> getAllPolicies() {
        return enforcer.getPolicy();
    }

    /**
     * Recharge les politiques depuis la base de données
     * Utile après une modification directe en base de données
     */
    public void reloadPolicy() {
        try {
            enforcer.loadPolicy();
            log.info("Politiques rechargées depuis la base de données");
        } catch (Exception e) {
            log.error("Erreur lors du rechargement des politiques", e);
        }
    }
}

