import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: `${window.location.origin}/auth/realms/iorecycling`,
  clientId: 'frontend',
  redirectUri: window.location.origin + '/',
  responseType: 'code',
  scope: 'openid profile email',
  requireHttps: false,
  showDebugInformation: true,
  sessionChecksEnabled: true,
  timeoutFactor: 0.01,
  checkOrigin: false,
  customQueryParams: {
    'kc_idp_hint': 'oidc'
  }
};
