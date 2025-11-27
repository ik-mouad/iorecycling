# 🧪 MODE TEST SANS AUTHENTIFICATION

Pour tester facilement les APIs via Swagger sans avoir à configurer Keycloak, voici comment désactiver temporairement l'authentification.

## Option 1 : Désactiver complètement la sécurité

### Modifier SecurityConfig.java

Localiser le fichier :
```
backend/src/main/java/ma/iorecycling/config/SecurityConfig.java
```

Remplacer la méthode `filterChain` par :

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(authz -> authz
            .anyRequest().permitAll()  // ✅ Permet tout temporairement
        );
    
    return http.build();
}
```

**⚠️ ATTENTION** : Ne pas commiter cette modification ! C'est uniquement pour les tests.

---

## Option 2 : Commenter les @PreAuthorize

### Dans chaque Controller

**AdminSocieteController.java** :
```java
@RestController
@RequestMapping("/api/admin/societes")
// @PreAuthorize("hasRole('ADMIN')")  // ✅ Commenté temporairement
public class AdminSocieteController {
    ...
}
```

**AdminEnlevementController.java** :
```java
@RestController
@RequestMapping("/api/admin/enlevements")
// @PreAuthorize("hasRole('ADMIN')")  // ✅ Commenté temporairement
public class AdminEnlevementController {
    ...
}
```

**ClientDashboardKpisController.java** :
```java
@RestController
@RequestMapping("/api/client/dashboard")
// @PreAuthorize("hasRole('CLIENT')")  // ✅ Commenté temporairement
public class ClientDashboardKpisController {
    ...
}
```

---

## Option 3 : Modifier temporairement ClientContextService

Pour tester les endpoints CLIENT qui nécessitent le societeId, hardcoder une valeur :

**ClientContextService.java** :
```java
public Long getClientId(Jwt jwt) {
    // ✅ TEMPORAIRE : Retourner ID 1 pour tests
    return 1L;
    
    // Code original à restaurer :
    // return jwt.getClaim("client_id");
}
```

---

## ✅ WORKFLOW DE TEST

1. **Appliquer Option 1 ou Option 2**
2. **Relancer l'application**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. **Tester dans Swagger**
   ```
   http://localhost:8080/swagger-ui.html
   ```
4. **Une fois les tests terminés, restaurer la sécurité**

---

## 🔒 RESTAURER LA SÉCURITÉ

Après les tests, **ne pas oublier** de :

1. ✅ Restaurer SecurityConfig.java (ou faire `git checkout SecurityConfig.java`)
2. ✅ Décommenter tous les @PreAuthorize
3. ✅ Restaurer ClientContextService.java
4. ✅ Vérifier avec `git diff` qu'on n'a pas laissé de modifications

---

## 🚀 ALTERNATIVE : Tests avec curl

Si vous préférez ne pas modifier le code, utilisez curl avec un token bidon :

```bash
# Les endpoints sans sécurité fonctionneront quand même
curl -X GET http://localhost:8080/api/health
```

Mais pour les endpoints sécurisés, il faudra un vrai token Keycloak.

