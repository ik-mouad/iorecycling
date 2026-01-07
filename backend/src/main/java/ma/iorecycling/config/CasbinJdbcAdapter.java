package ma.iorecycling.config;

import org.casbin.jcasbin.persist.Adapter;
import org.casbin.jcasbin.persist.Helper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Adaptateur JDBC personnalisé pour Casbin
 * Permet de charger et sauvegarder les politiques depuis la base de données PostgreSQL
 */
@Component
public class CasbinJdbcAdapter implements Adapter {

    private final JdbcTemplate jdbcTemplate;

    public CasbinJdbcAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void loadPolicy(org.casbin.jcasbin.model.Model model) {
        String sql = "SELECT ptype, v0, v1, v2, v3, v4, v5 FROM casbin_rule ORDER BY id";
        
        List<PolicyRow> rules = jdbcTemplate.query(sql, (rs, rowNum) -> {
            PolicyRow rule = new PolicyRow();
            rule.ptype = rs.getString("ptype");
            rule.v0 = rs.getString("v0");
            rule.v1 = rs.getString("v1");
            rule.v2 = rs.getString("v2");
            rule.v3 = rs.getString("v3");
            rule.v4 = rs.getString("v4");
            rule.v5 = rs.getString("v5");
            return rule;
        });

        for (PolicyRow rule : rules) {
            // Construire la ligne de politique au format Casbin
            StringBuilder line = new StringBuilder(rule.ptype);
            if (rule.v0 != null) line.append(", ").append(rule.v0);
            if (rule.v1 != null) line.append(", ").append(rule.v1);
            if (rule.v2 != null) line.append(", ").append(rule.v2);
            if (rule.v3 != null) line.append(", ").append(rule.v3);
            if (rule.v4 != null) line.append(", ").append(rule.v4);
            if (rule.v5 != null) line.append(", ").append(rule.v5);
            Helper.loadPolicyLine(line.toString(), model);
        }
    }

    @Override
    public void savePolicy(org.casbin.jcasbin.model.Model model) {
        // Supprimer toutes les règles existantes
        jdbcTemplate.update("DELETE FROM casbin_rule");

        // Sauvegarder toutes les règles du modèle
        // model.model est une Map<String, Map<String, Assertion>>
        for (java.util.Map.Entry<String, java.util.Map<String, org.casbin.jcasbin.model.Assertion>> sectionEntry : model.model.entrySet()) {
            java.util.Map<String, org.casbin.jcasbin.model.Assertion> section = sectionEntry.getValue();
            for (java.util.Map.Entry<String, org.casbin.jcasbin.model.Assertion> assertionEntry : section.entrySet()) {
                String ptype = assertionEntry.getKey();
                org.casbin.jcasbin.model.Assertion assertion = assertionEntry.getValue();
                for (List<String> rule : assertion.policy) {
                    savePolicyLine(ptype, rule);
                }
            }
        }
    }

    private void savePolicyLine(String ptype, List<String> rule) {
        if (rule.isEmpty()) {
            return;
        }

        String v0 = rule.size() > 0 ? rule.get(0) : null;
        String v1 = rule.size() > 1 ? rule.get(1) : null;
        String v2 = rule.size() > 2 ? rule.get(2) : null;
        String v3 = rule.size() > 3 ? rule.get(3) : null;
        String v4 = rule.size() > 4 ? rule.get(4) : null;
        String v5 = rule.size() > 5 ? rule.get(5) : null;

        String sql = "INSERT INTO casbin_rule (ptype, v0, v1, v2, v3, v4, v5) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, ptype, v0, v1, v2, v3, v4, v5);
    }

    @Override
    public void addPolicy(String sec, String ptype, List<String> rule) {
        savePolicyLine(ptype, rule);
    }

    @Override
    public void removePolicy(String sec, String ptype, List<String> rule) {
        // Construire la requête DELETE en fonction du nombre de paramètres dans la règle
        StringBuilder sql = new StringBuilder("DELETE FROM casbin_rule WHERE ptype = ?");
        List<Object> params = new ArrayList<>();
        params.add(ptype);
        
        for (int i = 0; i < rule.size() && i < 6; i++) {
            sql.append(" AND v").append(i).append(" = ?");
            params.add(rule.get(i));
        }
        
        jdbcTemplate.update(sql.toString(), params.toArray());
    }

    @Override
    public void removeFilteredPolicy(String sec, String ptype, int fieldIndex, String... fieldValues) {
        // Implémentation pour les politiques filtrées
        if (fieldIndex == 0 && fieldValues.length > 0) {
            String sql = "DELETE FROM casbin_rule WHERE ptype = ? AND v0 = ?";
            jdbcTemplate.update(sql, ptype, fieldValues[0]);
        } else {
            // Supprimer toutes les politiques du type donné
            String sql = "DELETE FROM casbin_rule WHERE ptype = ?";
            jdbcTemplate.update(sql, ptype);
        }
    }


    /**
     * Classe interne pour représenter une ligne de politique
     */
    private static class PolicyRow {
        String ptype;
        String v0;
        String v1;
        String v2;
        String v3;
        String v4;
        String v5;
    }
}
