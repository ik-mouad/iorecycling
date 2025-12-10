// Environnement de développement
export const environment = {
  production: false,
  apiUrl: 'http://localhost:88/api',
  keycloak: {
    url: 'http://localhost:88/auth',
    realm: 'iorecycling',
    clientId: 'frontend'
  }
};
