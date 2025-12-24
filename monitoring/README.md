# Observabilité IORecycling - Guide d'utilisation

Ce guide explique comment utiliser la stack d'observabilité complète mise en place pour IORecycling : **métriques (Prometheus)**, **logs (Loki)** et **traces (Tempo)** avec corrélation automatique.

## Architecture

```
Frontend Angular → Backend Spring Boot → Promtail → Loki (logs)
                                      ↓
                                    Tempo (traces)
                                      ↓
                                    Prometheus (métriques)
                                      ↓
                                    Grafana (visualisation + corrélation)
```

## Démarrage

### 1. Démarrer tous les services

```bash
docker compose up -d loki tempo promtail grafana prometheus backend
```

### 2. Vérifier que les services sont démarrés

```bash
docker compose ps
```

Vous devriez voir :
- `loki` sur le port 3100
- `tempo` sur les ports 3200 (HTTP), 4317 (OTLP gRPC), 4318 (OTLP HTTP)
- `promtail` (pas de port exposé, interne uniquement)
- `grafana` sur le port 3001
- `prometheus` sur le port 9090
- `backend` sur le port 8080

### 3. Accéder à Grafana

- URL : http://localhost:3001
- Identifiants : `admin` / `admin`

## Vérification de l'ingestion

### Vérifier les logs dans Loki

Dans Grafana, allez dans **Explore** → sélectionnez le datasource **Loki** → exécutez :

```logql
{service="iorecycling-backend"} | json
```

Vous devriez voir des logs JSON structurés avec les champs :
- `tenantId`, `userId`, `traceId`, `spanId`
- `http_route`, `http_method`, `http_status_code`
- `durationMs`, `exception_type`, `exception_message`

### Vérifier les traces dans Tempo

Dans Grafana, allez dans **Explore** → sélectionnez le datasource **Tempo** → exécutez :

```traceql
{ service.name = "iorecycling-backend" }
```

Vous devriez voir des traces avec des spans pour chaque requête HTTP.

### Vérifier les métriques dans Prometheus

Dans Grafana, allez dans **Explore** → sélectionnez le datasource **Prometheus** → exécutez :

```promql
rate(http_server_requests_seconds_count[5m])
```

## Filtrage multi-tenant

### Filtrer les logs par tenantId

```logql
{service="iorecycling-backend"} | json | tenantId="123"
```

### Filtrer les logs par userId

```logql
{service="iorecycling-backend"} | json | userId="user-abc-123"
```

### Filtrer les logs par traceId

```logql
{service="iorecycling-backend"} | json | traceId="a1b2c3d4e5f6..."
```

### Combiner plusieurs filtres

```logql
{service="iorecycling-backend"} | json | tenantId="123" | userId="user-abc" | level="ERROR"
```

## Retrouver le "film utilisateur"

Pour suivre toutes les actions d'un utilisateur sur une période donnée :

1. **Dans Grafana**, ouvrez le dashboard **"IORecycling - Observabilité Complète"**
2. Utilisez les variables en haut du dashboard :
   - Sélectionnez un `userId` dans le dropdown
   - Optionnellement, sélectionnez un `traceId` spécifique
3. Le panel **"Film utilisateur"** affichera tous les logs correspondants

**Requête LogQL manuelle** :

```logql
{service="iorecycling-backend"} | json | userId="<userId>" | traceId="<traceId>"
```

## Corrélation métrique → trace → logs

### Workflow de diagnostic

1. **Détecter un problème via les métriques** (Prometheus)
   - Exemple : latence p95 élevée sur un endpoint
   - Requête : `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{uri="/api/client/demandes"}[5m])) by (le))`

2. **Trouver la trace correspondante** (Tempo)
   - Dans Grafana Explore → Tempo
   - Filtrer par `service.name = "iorecycling-backend"` et `http.route = "/api/client/demandes"`
   - Cliquer sur une trace lente pour voir les détails

3. **Voir les logs associés** (Loki)
   - Depuis la vue trace dans Tempo, cliquer sur le bouton **"Logs"** (lien de corrélation automatique)
   - Ou utiliser le `traceId` affiché dans la trace :
     ```logql
     {service="iorecycling-backend"} | json | traceId="<traceId-from-trace>"
     ```

### Exemple concret

**Scénario** : Un client se plaint de lenteurs sur `/api/client/demandes`

1. **Vérifier les métriques** :
   ```promql
   histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{uri="/api/client/demandes"}[5m])) by (le))
   ```
   → Résultat : 2.5s (trop élevé)

2. **Trouver les traces lentes** :
   - Dans Tempo, filtrer : `{ service.name = "iorecycling-backend", http.route = "/api/client/demandes", duration > 2s }`
   - Identifier la trace avec `traceId = "abc123..."`

3. **Voir les logs de cette requête** :
   ```logql
   {service="iorecycling-backend"} | json | traceId="abc123..."
   ```
   → Voir tous les logs de cette requête, avec le tenantId, userId, et les détails de chaque étape

4. **Filtrer par tenant pour voir l'impact** :
   ```logql
   {service="iorecycling-backend"} | json | tenantId="123" | http_route="/api/client/demandes" | durationMs > 2000
   ```

## Requêtes LogQL utiles

### Top endpoints lents

```logql
topk(10, sum(rate({service="iorecycling-backend"} | json | __error__ = "" | unwrap durationMs [5m])) by (http_route))
```

### Top exceptions

```logql
topk(10, count_over_time({service="iorecycling-backend"} | json | level="ERROR" [5m]) by (exception_type))
```

### Erreurs 5xx par tenant

```logql
sum(rate({service="iorecycling-backend"} | json | http_status_code=~"5.." [5m])) by (tenantId)
```

### Logs d'erreur pour un tenant spécifique

```logql
{service="iorecycling-backend"} | json | tenantId="123" | level="ERROR"
```

### Requêtes lentes (>1s) par endpoint

```logql
{service="iorecycling-backend"} | json | durationMs > 1000 | unwrap durationMs
```

## Requêtes TraceQL utiles

### Traces avec erreurs

```traceql
{ service.name = "iorecycling-backend", status = error }
```

### Traces lentes (>1s)

```traceql
{ service.name = "iorecycling-backend" } | duration > 1s
```

### Traces pour un endpoint spécifique

```traceql
{ service.name = "iorecycling-backend", http.route = "/api/client/demandes" }
```

## Dashboards disponibles

1. **IORecycling - Performance Technique** : Métriques Prometheus (latence, RPS, erreurs, JVM, DB)
2. **IORecycling - Observabilité Complète** : Logs, traces, corrélation, filtrage multi-tenant

## Structure des logs JSON

Chaque log contient les champs suivants (via MDC enrichi) :

```json
{
  "@timestamp": "2025-12-15T12:00:00.000Z",
  "level": "INFO",
  "message": "POST /api/client/demandes - société 123",
  "service": "iorecycling-backend",
  "env": "dev",
  "tenantId": "123",
  "userId": "user-abc-123",
  "traceId": "a1b2c3d4e5f6...",
  "spanId": "e5f6g7h8...",
  "http_route": "/api/client/demandes",
  "http_method": "POST",
  "http_status_code": "200",
  "durationMs": "45",
  "logger_name": "ma.iorecycling.controller.ClientDemandeController",
  "thread": "http-nio-8080-exec-1"
}
```

En cas d'erreur, les champs supplémentaires :
```json
{
  "exception_type": "IllegalArgumentException",
  "exception_message": "Invalid request data"
}
```

## Points d'attention

### Cardinalité des labels

- Utiliser `tenantId` (Long) plutôt que `tenantName` (string) pour éviter l'explosion de cardinalité dans Loki
- Les labels doivent avoir une cardinalité limitée (< 100 valeurs uniques)

### Sécurité

- Les tokens et mots de passe ne sont **jamais** loggés (filtrés dans `LoggingContextFilter`)
- Les données sensibles sont automatiquement exclues du MDC

### Performance

- Le MDC est nettoyé après chaque requête pour éviter les memory leaks
- Les traces sont échantillonnées si nécessaire (configurable dans `application.yml`)

### Retention

- **Loki** : 30 jours (configurable dans `monitoring/loki/loki-config.yml`)
- **Tempo** : 7 jours (configurable dans `monitoring/tempo/tempo-config.yml`)
- **Prometheus** : 15 jours (par défaut)

## Dépannage

### Les logs n'apparaissent pas dans Loki

1. Vérifier que Promtail est démarré : `docker compose ps promtail`
2. Vérifier les logs de Promtail : `docker compose logs promtail`
3. Vérifier que le volume `./logs` est monté correctement
4. Vérifier que le backend écrit dans `/var/log/backend/app.log`

### Les traces n'apparaissent pas dans Tempo

1. Vérifier que Tempo est démarré : `docker compose ps tempo`
2. Vérifier les logs de Tempo : `docker compose logs tempo`
3. Vérifier que le backend a la variable `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
4. Vérifier les logs du backend pour les erreurs OpenTelemetry

### La corrélation ne fonctionne pas

1. Vérifier que les datasources Loki et Tempo sont correctement configurés dans Grafana
2. Vérifier que le `traceId` est présent dans les logs JSON
3. Vérifier que le format du `traceId` correspond (32 caractères hex)

## Support

Pour toute question ou problème, consulter :
- Documentation Loki : https://grafana.com/docs/loki/latest/
- Documentation Tempo : https://grafana.com/docs/tempo/latest/
- Documentation OpenTelemetry : https://opentelemetry.io/docs/

