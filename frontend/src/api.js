import { getAccessToken } from "./auth";

const apiUrl = import.meta.env.VITE_API_URL;

function mensajePorEstado(status) {
  const mensajes = {
    400: "La solicitud contiene datos inválidos.",
    401: "Tu sesión no es válida o ha expirado.",
    403: "No tienes permisos para realizar esta operación.",
    404: "La solicitud no fue encontrada.",
  };
  return mensajes[status] || `La API respondió con HTTP ${status}.`;
}

async function solicitar(method, path, body) {
  const headers = { Authorization: `Bearer ${getAccessToken()}` };
  const opciones = { method, headers, cache: "no-store" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(body);
  }

  try {
    const respuesta = await fetch(`${apiUrl}${path}`, opciones);
    if (respuesta.status === 204) {
      if (!respuesta.ok) {
        throw new Error(mensajePorEstado(respuesta.status));
      }
      return null;
    }

    const texto = await respuesta.text();
    let cuerpo = null;

    if (texto) {
      try {
        cuerpo = JSON.parse(texto);
      } catch {
        cuerpo = texto;
      }
    }

    if (!respuesta.ok) {
      const detalle = typeof cuerpo === "object" ? cuerpo?.message || cuerpo?.error : cuerpo;
      throw new Error(detalle || mensajePorEstado(respuesta.status));
    }
    return cuerpo;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No fue posible comunicarse con la API. Revisa la conexión o CORS.");
    }
    throw error;
  }
}

export function listarMisSolicitudes() {
  return solicitar("GET", "/solicitudes/mias");
}

export function listarSolicitudesPendientes() {
  return solicitar("GET", "/solicitudes/pendientes");
}

export function obtenerSolicitud(id) {
  return solicitar("GET", `/solicitudes/${encodeURIComponent(id)}`);
}

export function crearSolicitud(datos) {
  return solicitar("POST", "/solicitudes", {
    tipo: datos.tipo,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    motivo: datos.motivo,
  });
}

export function actualizarSolicitud(id, datos) {
  return solicitar("PUT", `/solicitudes/${encodeURIComponent(id)}`, {
    tipo: datos.tipo,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    motivo: datos.motivo,
  });
}

export function eliminarSolicitud(id) {
  return solicitar("DELETE", `/solicitudes/${encodeURIComponent(id)}`);
}

export function decidirSolicitud(id, decision, comentario) {
  if (!["APROBADA", "RECHAZADA"].includes(decision)) {
    throw new Error("La decisión debe ser APROBADA o RECHAZADA.");
  }
  return solicitar("PATCH", `/solicitudes/${encodeURIComponent(id)}/decision`, {
    decision,
    comentario,
  });
}
