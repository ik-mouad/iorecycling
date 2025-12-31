// Environnement de production
export const environment = {
  production: true,
  apiUrl: '/api',
  keycloak: {
    url: '/auth',
    realm: 'iorecycling',
    clientId: 'frontend'
  }
};
