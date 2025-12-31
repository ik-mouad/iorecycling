import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

export const authConfig: AuthConfig = {
  issuer: `${window.location.origin}${environment.keycloak.url}/realms/${environment.keycloak.realm}`,
  clientId: environment.keycloak.clientId,
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
