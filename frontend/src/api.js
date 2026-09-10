import { config, getAccessToken } from "./auth";

const region = import.meta.env.VITE_AWS_REGION;
const apiUrl = import.meta.env.VITE_API_URL;

async function solicitar(descripcion, url, opciones = {}) {
  try {
    const respuesta = await fetch(url, { cache: "no-store", ...opciones });
    const texto = await respuesta.text();
    let cuerpo = texto;

    if (texto) {
      try {
        cuerpo = JSON.parse(texto);
      } catch {
        cuerpo = texto;
      }
    }

    return {
      descripcion,
      status: respuesta.status,
      ok: respuesta.ok,
      cuerpo,
    };
  } catch (error) {
    return {
      descripcion,
      status: null,
      ok: false,
      cuerpo: error instanceof Error ? error.message : "Error de red o CORS.",
    };
  }
}

function opcionesConToken() {
  return { headers: { Authorization: `Bearer ${getAccessToken()}` } };
}

export function obtenerUserInfo() {
  return solicitar(`${config.dominio}/oauth2/userInfo`, `${config.dominio}/oauth2/userInfo`, opcionesConToken());
}

export function obtenerUsuarioCognito() {
  return solicitar(
    "Cognito GetUser",
    `https://cognito-idp.${region}.amazonaws.com/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
      },
      body: JSON.stringify({ AccessToken: getAccessToken() }),
    },
  );
}

export function obtenerIndicadores(conToken = true) {
  if (conToken) {
    return solicitar("/datos con token", `${apiUrl}/datos`, opcionesConToken());
  }

  return solicitar("/datos sin token", `${apiUrl}/datos`);
}

export function obtenerIndicadoresPublicos() {
  return solicitar("/publico/datos", `${apiUrl}/publico/datos`);
}
