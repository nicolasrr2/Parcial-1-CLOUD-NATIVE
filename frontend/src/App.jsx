import { useEffect, useState } from "react";
import {
  estaExpirado,
  getAccessToken,
  getAccessTokenClaims,
  getGroups,
  getScopes,
  getTokens,
  login,
  logout,
  procesarRetorno,
  validarConfiguracion,
} from "./auth";
import SolicitanteView from "./components/SolicitanteView";
import AprobadorView from "./components/AprobadorView";
import TokenClaims from "./components/TokenClaims";

export default function App() {
  const [tokens, setTokens] = useState(getTokens());
  const [error, setError] = useState("");
  const configuracionFaltante = validarConfiguracion();
  const accessToken = tokens?.access_token || getAccessToken();
  const autenticado = Boolean(accessToken && !estaExpirado(accessToken));
  const tokenExpirado = Boolean(accessToken && estaExpirado(accessToken));
  const claims = autenticado ? getAccessTokenClaims() : null;
  const grupos = autenticado ? getGroups() : [];
  const scopes = autenticado ? getScopes() : [];
  const puedeSolicitar = grupos.includes("solicitantes");
  const puedeAprobar = grupos.includes("aprobadores");
  const [vista, setVista] = useState(puedeSolicitar ? "solicitante" : "aprobador");

  useEffect(() => {
    if (puedeSolicitar && !puedeAprobar) {
      setVista("solicitante");
    } else if (!puedeSolicitar && puedeAprobar) {
      setVista("aprobador");
    }
  }, [puedeSolicitar, puedeAprobar]);

  useEffect(() => {
    let activo = true;
    procesarRetorno()
      .then((nuevosTokens) => {
        if (activo && nuevosTokens) {
          setTokens(nuevosTokens);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err instanceof Error ? err.message : "Error al procesar el retorno de Cognito.");
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  async function iniciarSesion() {
    try {
      setError("");
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion.");
    }
  }

  if (configuracionFaltante.length > 0) {
    return (
      <main className="contenedor">
        <h1>DSY1107 · Identidad con Cognito</h1>
        <div className="alerta error">Falta configuracion: {configuracionFaltante.join(", ")}</div>
      </main>
    );
  }

  if (!autenticado) {
    return (
      <main className="contenedor inicio">
        <p className="eyebrow">Pedidos360</p>
        <h1>Pedidos360</h1>
        <p className="intro">Gestión segura de solicitudes</p>
        {tokenExpirado && (
          <div className="alerta advertencia">
            El access token expiro. Inicia sesion nuevamente para obtener tokens validos.
          </div>
        )}
        {error && <div className="alerta error">{error}</div>}
        <button type="button" onClick={iniciarSesion}>Iniciar sesión</button>
      </main>
    );
  }

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div>
          <p className="eyebrow">Gestión segura de solicitudes</p>
          <h1>Pedidos360</h1>
          <p className="intro">{claims?.email || claims?.username || claims?.sub || "Usuario autenticado"}</p>
        </div>
        <button type="button" className="boton peligro" onClick={logout}>Cerrar sesión</button>
      </header>

      {error && <div className="alerta error">{error}</div>}

      <section className="panel resumen-seguridad">
        <div>
          <span className="etiqueta">Grupos</span>
          <strong>{grupos.length ? grupos.join(", ") : "Sin grupos"}</strong>
        </div>
        <div>
          <span className="etiqueta">Scopes</span>
          <strong>{scopes.length ? scopes.join(", ") : "Sin scopes"}</strong>
        </div>
      </section>

      <TokenClaims claims={claims} />

      {puedeSolicitar && puedeAprobar && (
        <nav className="pestanas" aria-label="Vistas de solicitudes">
          <button className={vista === "solicitante" ? "pestana activa" : "pestana"} onClick={() => setVista("solicitante")} type="button">Mis solicitudes</button>
          <button className={vista === "aprobador" ? "pestana activa" : "pestana"} onClick={() => setVista("aprobador")} type="button">Solicitudes pendientes</button>
        </nav>
      )}

      {puedeSolicitar && vista === "solicitante" && <SolicitanteView scopes={scopes} />}
      {puedeAprobar && vista === "aprobador" && <AprobadorView scopes={scopes} />}
      {!puedeSolicitar && !puedeAprobar && (
        <div className="alerta advertencia">No tienes un rol asignado para utilizar Pedidos360.</div>
      )}
    </main>
  );
}
