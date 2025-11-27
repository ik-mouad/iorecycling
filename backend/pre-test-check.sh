#!/bin/bash

# Script de vérification avant tests Swagger
# Vérifie que tout est prêt pour lancer l'application

echo "🔍 Vérification pré-tests IORecycling..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur d'erreurs
ERRORS=0

# 1. Vérifier Java
echo -n "☕ Java installé... "
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo -e "${GREEN}✓${NC} (version $JAVA_VERSION)"
else
    echo -e "${RED}✗ Java non trouvé${NC}"
    ERRORS=$((ERRORS+1))
fi

# 2. Vérifier Maven
echo -n "🔨 Maven installé... "
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -v 2>&1 | grep "Apache Maven" | awk '{print $3}')
    echo -e "${GREEN}✓${NC} (version $MVN_VERSION)"
else
    echo -e "${RED}✗ Maven non trouvé${NC}"
    ERRORS=$((ERRORS+1))
fi

# 3. Vérifier PostgreSQL (Docker)
echo -n "🐘 PostgreSQL (Docker)... "
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✓${NC} (en cours d'exécution)"
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL Docker non trouvé (lancer docker-compose up -d postgres)"
fi

# 4. Vérifier port 8080 disponible
echo -n "🔌 Port 8080 disponible... "
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC} Port 8080 déjà utilisé"
    echo "   Processus: $(lsof -Pi :8080 -sTCP:LISTEN | tail -1)"
else
    echo -e "${GREEN}✓${NC}"
fi

# 5. Vérifier pom.xml
echo -n "📦 pom.xml présent... "
if [ -f "pom.xml" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ pom.xml non trouvé (êtes-vous dans /backend ?)${NC}"
    ERRORS=$((ERRORS+1))
fi

# 6. Vérifier migration Flyway V4
echo -n "🗄️  Migration V4... "
if [ -f "src/main/resources/db/migration/V4__new_model.sql" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} V4__new_model.sql non trouvé"
fi

# 7. Vérifier les entités
echo -n "📦 Entités JPA... "
ENTITIES_COUNT=$(find src/main/java/ma/iorecycling/entity -name "*.java" 2>/dev/null | wc -l)
if [ "$ENTITIES_COUNT" -ge 6 ]; then
    echo -e "${GREEN}✓${NC} ($ENTITIES_COUNT fichiers)"
else
    echo -e "${YELLOW}⚠${NC} Seulement $ENTITIES_COUNT entités trouvées (6 attendues)"
fi

# 8. Vérifier les controllers
echo -n "🌐 Controllers REST... "
CONTROLLERS_COUNT=$(find src/main/java/ma/iorecycling/controller -name "*.java" 2>/dev/null | wc -l)
if [ "$CONTROLLERS_COUNT" -ge 3 ]; then
    echo -e "${GREEN}✓${NC} ($CONTROLLERS_COUNT fichiers)"
else
    echo -e "${YELLOW}⚠${NC} Seulement $CONTROLLERS_COUNT controllers trouvés"
fi

echo ""
echo "────────────────────────────────────────"

# Résumé
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est prêt pour les tests !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "  1. mvn clean install"
    echo "  2. mvn spring-boot:run"
    echo "  3. Ouvrir http://localhost:8080/swagger-ui.html"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
    echo ""
    echo "Corrigez les erreurs avant de continuer."
    exit 1
fi

