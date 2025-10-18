FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copier le pom.xml et télécharger les dépendances
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Copier le code source et construire l'application
COPY src ./src
RUN mvn -q -Dmaven.test.skip=true clean package

# Stage de production
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copier le JAR depuis le stage de build
ARG JAR_FILE=target/*.jar
COPY --from=build /app/${JAR_FILE} app.jar

# Changer les permissions et propriétaire
RUN chown -R appuser:appgroup /app
USER appuser

# Exposer le port
EXPOSE 8080

# Point d'entrée
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

