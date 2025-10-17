# Stage de build
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances (incluant dev dependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Stage de production
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits depuis le stage de build
COPY --from=build /app/dist/iorecycling-frontend /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

