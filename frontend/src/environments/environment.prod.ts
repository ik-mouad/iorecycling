// Environnement de production
export const environment = {
  production: true,
  apiUrl: 'https://iorecycling.duckdns.org/api',
  keycloak: {
    url: 'https://iorecycling.duckdns.org/auth',
    realm: 'iorecycling',
    clientId: 'frontend'
  }
};
