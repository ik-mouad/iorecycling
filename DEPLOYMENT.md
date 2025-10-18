# 🚀 Guide de Déploiement IORecycling

## 📋 Prérequis

### Sur le serveur VPS

1. **Docker et Docker Compose installés**
   ```bash
   # Installation de Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Installation de Docker Compose
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   
   # Ajouter l'utilisateur au groupe docker
   sudo usermod -aG docker $USER
   ```

2. **Git installé**
   ```bash
   sudo apt-get install git
   ```

3. **Repository cloné**
   ```bash
   cd /opt
   sudo mkdir -p iorecycling
   sudo chown $USER:$USER iorecycling
   cd iorecycling
   git clone https://github.com/ik-mouad/iorecycling.git .
   ```

4. **Fichier .env configuré**
   ```bash
   cp env.example .env
   # Éditer .env avec vos valeurs
   nano .env
   ```

---

## 🔐 Configuration des Secrets GitHub

Allez dans **Settings → Secrets and variables → Actions** de votre repository GitHub et ajoutez les secrets suivants :

### Secrets SSH Requis

| Secret Name | Description | Exemple |
|------------|-------------|---------|
| `SSH_HOST` | Adresse IP ou domaine du VPS | `146.59.234.174` |
| `SSH_USER` | Nom d'utilisateur SSH | `ubuntu` |
| `SSH_KEY` | Clé privée SSH (complète) | Voir ci-dessous |
| `SSH_PORT` | Port SSH (optionnel) | `22` (défaut) |
| `APP_DIR` | Répertoire de l'application | `/opt/iorecycling` |

### Secrets E2E Tests (optionnels)

| Secret Name | Description | Exemple |
|------------|-------------|---------|
| `E2E_USER` | Utilisateur Keycloak pour tests | `client1` |
| `E2E_PASS` | Mot de passe pour tests | `votre_mot_de_passe` |

---

## 🔑 Génération de la Clé SSH

### Sur votre machine locale

1. **Générer une paire de clés SSH** (si vous n'en avez pas déjà une)
   ```bash
   ssh-keygen -t ed25519 -C "github-actions@iorecycling" -f ~/.ssh/iorecycling_deploy
   ```

2. **Copier la clé publique sur le VPS**
   ```bash
   ssh-copy-id -i ~/.ssh/iorecycling_deploy.pub ubuntu@146.59.234.174
   ```
   
   Ou manuellement :
   ```bash
   # Sur le VPS
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   nano ~/.ssh/authorized_keys
   # Coller la clé publique
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Copier la clé privée complète**
   ```bash
   cat ~/.ssh/iorecycling_deploy
   ```
   
   Copiez **TOUT** le contenu, y compris :
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ...
   -----END OPENSSH PRIVATE KEY-----
   ```

4. **Ajouter la clé privée comme secret `SSH_KEY` dans GitHub**
   - Aller dans : **Repository → Settings → Secrets and variables → Actions**
   - Cliquer sur **New repository secret**
   - Name: `SSH_KEY`
   - Value: Coller tout le contenu de la clé privée
   - Cliquer sur **Add secret**

---

## 🧪 Tester la Connexion SSH

### Depuis votre machine locale

```bash
ssh -i ~/.ssh/iorecycling_deploy ubuntu@146.59.234.174
```

Si la connexion fonctionne, GitHub Actions pourra aussi se connecter.

---

## 🔄 Déploiement Manuel

Si vous voulez déployer manuellement :

```bash
# Se connecter au VPS
ssh ubuntu@146.59.234.174

# Aller dans le répertoire
cd /opt/iorecycling

# Tirer les dernières modifications
git pull origin develop

# Redémarrer les services
docker compose down
docker compose up -d --build

# Vérifier les logs
docker compose logs -f
```

---

## 🔍 Débogage

### Vérifier les secrets GitHub

Les secrets configurés apparaîtront (masqués) dans les logs GitHub Actions. Vérifiez qu'ils sont bien configurés.

### Erreur "ssh: handshake failed"

**Cause** : La clé SSH n'est pas configurée correctement

**Solutions** :
1. Vérifiez que le secret `SSH_KEY` contient la clé privée **complète**
2. Vérifiez que la clé publique est dans `~/.ssh/authorized_keys` sur le VPS
3. Vérifiez les permissions :
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### Vérifier les logs de déploiement

```bash
# Logs de tous les services
docker compose logs

# Logs d'un service spécifique
docker compose logs backend
docker compose logs frontend

# Suivre les logs en temps réel
docker compose logs -f
```

### Vérifier l'état des services

```bash
docker compose ps
docker compose top
```

---

## 📊 Workflow de Déploiement

### Déploiement Automatique

1. **Push sur `develop`** → Déploiement sur environnement de QUALIFICATION
2. **Push sur `main`** → Déploiement sur environnement de PRODUCTION

### Pipeline CI/CD

```
┌─────────────┐
│    Push     │
│  to GitHub  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Build      │
│  Backend    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Build      │
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Build      │
│  Docker     │
│  Images     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Deploy     │
│  to VPS     │
└─────────────┘
```

---

## 🌐 URLs de l'Application

### Environnement de Qualification (develop)

- **Frontend** : http://146.59.234.174:88/
- **API Health** : http://146.59.234.174:88/api/health
- **Keycloak** : http://146.59.234.174:88/auth/
- **MinIO Console** : http://146.59.234.174:9001/

### Environnement de Production (main)

*(Configurer avec votre domaine personnalisé)*

---

## 📝 Checklist de Déploiement

- [ ] Docker et Docker Compose installés sur le VPS
- [ ] Repository cloné dans `/opt/iorecycling`
- [ ] Fichier `.env` configuré
- [ ] Paire de clés SSH générée
- [ ] Clé publique copiée sur le VPS
- [ ] Secret `SSH_KEY` configuré dans GitHub
- [ ] Secret `SSH_HOST` configuré dans GitHub
- [ ] Secret `SSH_USER` configuré dans GitHub
- [ ] Secret `APP_DIR` configuré dans GitHub
- [ ] Test de connexion SSH réussi
- [ ] Push sur `develop` pour tester le déploiement automatique

---

## 🆘 Support

En cas de problème, vérifiez :

1. Les logs GitHub Actions
2. Les logs Docker sur le VPS : `docker compose logs`
3. L'état des services : `docker compose ps`
4. La connectivité SSH : `ssh -v ubuntu@IP_VPS`
5. Les permissions des fichiers `.env` et `docker-compose.yml`

---

## 🔒 Sécurité

⚠️ **Important** :

- **Ne jamais commiter** le fichier `.env` dans Git
- **Ne jamais partager** la clé privée SSH
- **Changer régulièrement** les mots de passe Keycloak
- **Utiliser HTTPS** en production avec un certificat SSL
- **Configurer un firewall** sur le VPS (UFW)
- **Mettre à jour régulièrement** le système et Docker

```bash
# Configuration basique du firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 88/tcp
sudo ufw allow 9001/tcp
sudo ufw enable
```

---

**Dernière mise à jour** : 18 octobre 2025
