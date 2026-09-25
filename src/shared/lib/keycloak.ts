import Keycloak from 'keycloak-js';

// Realm/client do módulo BCM (ver FRONT-MIGRAÇÃO.md) — Authorization Code + PKCE.
export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

let initPromise: Promise<boolean> | null = null;

// Garante uma única chamada a keycloak.init() mesmo com StrictMode/re-render.
export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      // App (5173) e Keycloak (8180) são origens diferentes: o navegador trata o iframe de
      // checkLoginIframe como terceiro e bloqueia, quebrando o init() com "Error while
      // checking login iframe". Não é essencial (só detecta logout feito em outra aba).
      checkLoginIframe: false,
    });
  }
  return initPromise;
}

const TOKEN_MIN_VALIDITY_SECONDS = 30;

export async function getFreshToken(): Promise<string | undefined> {
  if (!keycloak.authenticated) return undefined;
  try {
    await keycloak.updateToken(TOKEN_MIN_VALIDITY_SECONDS);
  } catch {
    await keycloak.login();
  }
  return keycloak.token;
}
