// Environnement de production
export const environment = {
  production: true,
  apiUrl: 'http://localhost:88/api',
  keycloak: {
    url: 'http://localhost:88/auth',
    realm: 'iorecycling',
    clientId: 'frontend'
  }
};
