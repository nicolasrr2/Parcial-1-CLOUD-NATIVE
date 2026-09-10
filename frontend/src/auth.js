const PKCE_VERIFIER_KEY = "DSY1107_pkce_verifier";
const OAUTH_STATE_KEY = "DSY1107_oauth_state";
const TOKENS_KEY = "DSY1107_tokens";

export const config = {
  dominio: import.meta.env.VITE_COGNITO_DOMAIN,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  scopes: "openid email profile aws.cognito.signin.user.admin",
};

export function validarConfiguracion() {
  return [
    ["VITE_COGNITO_DOMAIN", config.dominio],
    ["VITE_COGNITO_CLIENT_ID", config.clientId],
    ["VITE_REDIRECT_URI", config.redirectUri],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

function convertirBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generarTextoAleatorio(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return convertirBase64Url(bytes);
}

async function crearCodeChallenge(verifier) {
  const datos = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return convertirBase64Url(new Uint8Array(hash));
}

export async function login() {
  const missing = validarConfiguracion();
  if (missing.length > 0) {
    throw new Error(`Falta configuracion: ${missing.join(", ")}`);
  }

  const verifier = generarTextoAleatorio(32);
  const state = generarTextoAleatorio(32);
  const challenge = await crearCodeChallenge(verifier);

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  const parametros = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${config.dominio}/oauth2/authorize?${parametros}`);
}

export async function procesarRetorno() {
  const url = new URL(window.location.href);
  const error = url.searchParams.get("error");

  if (error) {
    const descripcion = url.searchParams.get("error_description") || error;
    throw new Error(`Cognito rechazo el inicio de sesion: ${descripcion}`);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    return null;
  }

  const state = url.searchParams.get("state");
  const stateGuardado = sessionStorage.getItem(OAUTH_STATE_KEY);
  if (!state || !stateGuardado || state !== stateGuardado) {
    throw new Error("El estado OAuth no coincide. Se detuvo el retorno por seguridad.");
  }

  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error("No se encontro el code_verifier de PKCE en la sesion.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
  });

  let respuesta;
  try {
    respuesta = await fetch(`${config.dominio}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    throw new Error("No fue posible comunicarse con Cognito para canjear el codigo.");
  }

  const texto = await respuesta.text();
  let tokens;
  try {
    tokens = JSON.parse(texto);
  } catch {
    throw new Error("Cognito devolvio una respuesta invalida durante el canje del codigo.");
  }

  if (!respuesta.ok) {
    throw new Error(tokens.error_description || tokens.error || `Error de Cognito HTTP ${respuesta.status}.`);
  }

  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);

  ["code", "state", "error", "error_description", "error_uri"].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

  return tokens;
}

export function getTokens() {
  const stored = sessionStorage.getItem(TOKENS_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    sessionStorage.removeItem(TOKENS_KEY);
    return null;
  }
}

export function getAccessToken() {
  return getTokens()?.access_token || null;
}

export function getIdToken() {
  return getTokens()?.id_token || null;
}

export function decodificarJwt(token) {
  if (!token) {
    return null;
  }

  try {
    const partePayload = token.split(".")[1];
    const base64 = partePayload.replace(/-/g, "+").replace(/_/g, "/");
    const texto = decodeURIComponent(
      atob(base64)
        .split("")
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    // Solo decodifica para mostrar datos; no verifica la firma del JWT.
    return JSON.parse(texto);
  } catch {
    throw new Error("No se pudo decodificar el token para mostrar sus claims.");
  }
}

export function estaExpirado(token) {
  if (!token) {
    return true;
  }

  try {
    const payload = decodificarJwt(token);
    return !payload?.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function logout() {
  sessionStorage.removeItem(TOKENS_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);

  const parametros = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: config.redirectUri,
  });
  window.location.assign(`${config.dominio}/logout?${parametros}`);
}
