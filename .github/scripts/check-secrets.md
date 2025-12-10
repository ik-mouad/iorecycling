# ✅ Checklist de Configuration des Secrets GitHub

## 🔐 Secrets Requis pour le Déploiement

Allez dans **Settings → Secrets and variables → Actions** et vérifiez que ces secrets sont configurés :

### 1. SSH_HOST
- **Description** : Adresse IP ou domaine du serveur VPS
- **Exemple** : `146.59.234.174` ou `iorecycling.example.com`
- **Statut** : ❌ NON CONFIGURÉ (d'après l'erreur SSH)

### 2. SSH_USER
- **Description** : Nom d'utilisateur SSH sur le VPS
- **Exemple** : `ubuntu` ou `root`
- **Statut** : ❌ NON CONFIGURÉ

### 3. SSH_KEY
- **Description** : Clé privée SSH complète (incluant BEGIN et END)
- **Format** :
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
  ... (plusieurs lignes) ...
  -----END OPENSSH PRIVATE KEY-----
  ```
- **Statut** : ❌ NON CONFIGURÉ (erreur d'authentification SSH)

### 4. SSH_PORT (optionnel)
- **Description** : Port SSH
- **Défaut** : `22`
- **Statut** : ⚠️ OPTIONNEL

### 5. APP_DIR
- **Description** : Chemin du répertoire de l'application sur le VPS
- **Exemple** : `/opt/iorecycling`
- **Statut** : ❌ NON CONFIGURÉ

---

## 🔧 Comment Configurer les Secrets

### Étape 1 : Générer une Clé SSH

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions-iorecycling" -f ~/.ssh/iorecycling_deploy

# Afficher la clé publique
cat ~/.ssh/iorecycling_deploy.pub

# Afficher la clé privée (pour GitHub)
cat ~/.ssh/iorecycling_deploy
```

### Étape 2 : Copier la Clé Publique sur le VPS

**Méthode 1 - Automatique** :
```bash
ssh-copy-id -i ~/.ssh/iorecycling_deploy.pub ubuntu@146.59.234.174
```

**Méthode 2 - Manuelle** :
```bash
# Se connecter au VPS avec votre méthode actuelle (mot de passe, etc.)
ssh ubuntu@146.59.234.174

# Sur le VPS
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Coller la clé publique (une seule ligne)
chmod 600 ~/.ssh/authorized_keys
```

### Étape 3 : Tester la Connexion SSH

```bash
# Depuis votre machine locale
ssh -i ~/.ssh/iorecycling_deploy ubuntu@146.59.234.174

# Si ça fonctionne, vous devriez vous connecter sans mot de passe
```

### Étape 4 : Ajouter les Secrets dans GitHub

1. Aller sur : https://github.com/ik-mouad/iorecycling/settings/secrets/actions

2. Cliquer sur **New repository secret** pour chaque secret :

   **SSH_HOST** :
   - Name: `SSH_HOST`
   - Value: `146.59.234.174` (ou votre IP VPS)
   
   **SSH_USER** :
   - Name: `SSH_USER`
   - Value: `ubuntu`
   
   **SSH_KEY** :
   - Name: `SSH_KEY`
   - Value: Copier **TOUT** le contenu de `~/.ssh/iorecycling_deploy` (clé privée)
   ```bash
   cat ~/.ssh/iorecycling_deploy
   ```
   
   **APP_DIR** :
   - Name: `APP_DIR`
   - Value: `/opt/iorecycling`

### Étape 5 : Vérifier la Configuration

Après avoir configuré les secrets, faites un push sur `develop` :

```bash
git commit --allow-empty -m "Test: Vérification du déploiement automatique"
git push origin develop
```

Puis vérifiez les GitHub Actions pour voir si le déploiement réussit.

---

## 🐛 Problèmes Courants

### Erreur: "ssh: handshake failed: ssh: unable to authenticate"

**Cause** : La clé SSH n'est pas configurée ou incorrecte

**Solutions** :
1. Vérifiez que le secret `SSH_KEY` contient la clé privée **complète**
2. Vérifiez que la clé publique est bien dans `~/.ssh/authorized_keys` sur le VPS
3. Testez la connexion SSH manuellement depuis votre machine
4. Vérifiez les permissions sur le VPS :
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### Erreur: "permission denied"

**Cause** : Permissions incorrectes ou utilisateur non autorisé

**Solutions** :
1. Vérifiez que l'utilisateur a accès à Docker :
   ```bash
   sudo usermod -aG docker ubuntu
   # Déconnectez-vous et reconnectez-vous
   ```
2. Vérifiez les permissions du répertoire :
   ```bash
   sudo chown -R ubuntu:ubuntu /opt/iorecycling
   ```

### Les services ne démarrent pas

**Solutions** :
1. Vérifiez les logs :
   ```bash
   cd /opt/iorecycling
   docker compose logs
   ```
2. Vérifiez le fichier `.env`
3. Vérifiez que les ports ne sont pas déjà utilisés :
   ```bash
   sudo netstat -tulpn | grep LISTEN
   ```

---

## 📊 Monitoring du Déploiement

### Vérifier l'État des Services

```bash
# État des containers
docker compose ps

# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Ressources utilisées
docker stats
```

### Vérifier l'Application

```bash
# Health check du backend
curl http://localhost:8080/api/health

# Frontend
curl http://localhost:88/

# Keycloak
curl http://localhost:88/auth/
```

---

## 🔄 Rollback en Cas de Problème

```bash
# Se connecter au VPS
ssh ubuntu@146.59.234.174

# Aller dans le répertoire
cd /opt/iorecycling

# Revenir à un commit précédent
git log --oneline
git reset --hard <COMMIT_HASH>

# Redémarrer les services
docker compose down
docker compose up -d --build
```

---

## 📝 Notes

- Les secrets GitHub sont **chiffrés** et ne peuvent pas être lus après leur création
- Si vous perdez une clé SSH, générez-en une nouvelle
- Sauvegardez votre clé SSH privée dans un endroit sûr
- Utilisez des clés SSH différentes pour dev et prod si possible

---

**Pour toute question, consultez la documentation ou contactez l'équipe DevOps.**

