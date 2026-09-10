import { useEffect, useState } from "react";
import {
  config,
  decodificarJwt,
  estaExpirado,
  getAccessToken,
  getIdToken,
  getTokens,
  login,
  logout,
  procesarRetorno,
  validarConfiguracion,
} from "./auth";
import {
  obtenerIndicadores,
  obtenerIndicadoresPublicos,
  obtenerUserInfo,
  obtenerUsuarioCognito,
} from "./api";

const acciones = [
  { texto: "/oauth2/userInfo", ejecutar: obtenerUserInfo },
  { texto: "Cognito GetUser", ejecutar: obtenerUsuarioCognito },
  { texto: "/datos con token", ejecutar: () => obtenerIndicadores(true) },
  { texto: "/datos sin token", ejecutar: () => obtenerIndicadores(false), advertencia: true },
  { texto: "/publico/datos", ejecutar: obtenerIndicadoresPublicos },
];

function formatearCuerpo(cuerpo) {
  return typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo, null, 2);
}

function Resultado({ resultado }) {
  if (!resultado) {
    return null;
  }

  const esperado = resultado.descripcion === "/datos sin token" && resultado.status === 401;
  const clase = esperado ? "resultado esperado" : resultado.ok ? "resultado exito" : "resultado fallo";
  const etiqueta = esperado ? "Esperado" : resultado.ok ? "Correcto" : "Fallo";

  return (
    <article className={clase}>
      <div className="resultado-cabecera">
        <strong>{resultado.descripcion}</strong>
        <span>{etiqueta}</span>
      </div>
      <p>HTTP {resultado.status ?? "sin respuesta"}</p>
      {esperado && <p>El 401 confirma que el authorizer protege esta ruta sin token.</p>}
      <pre>{formatearCuerpo(resultado.cuerpo)}</pre>
    </article>
  );
}

function Claims({ titulo, token }) {
  return (
    <details className="claims">
      <summary>{titulo}</summary>
      <pre>{formatearCuerpo(decodificarJwt(token))}</pre>
    </details>
  );
}

export default function App() {
  const [tokens, setTokens] = useState(getTokens());
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultados, setResultados] = useState({});
  const configuracionFaltante = validarConfiguracion();
  const accessToken = tokens?.access_token || getAccessToken();
  const autenticado = Boolean(accessToken && !estaExpirado(accessToken));
  const tokenExpirado = Boolean(accessToken && estaExpirado(accessToken));

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

  async function ejecutarAccion(accion) {
    setCargando(accion.texto);
    setError("");
    const resultado = await accion.ejecutar();
    setResultados((anteriores) => ({ ...anteriores, [accion.texto]: resultado }));
    setCargando("");
  }

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
        <p className="eyebrow">Laboratorio Cloud Native</p>
        <h1>DSY1107 · Identidad con Cognito</h1>
        <p className="intro">
          Esta aplicacion demuestra OAuth2 Authorization Code con PKCE y el acceso a una API protegida por Cognito.
        </p>
        {tokenExpirado && (
          <div className="alerta advertencia">
            El access token expiro. Inicia sesion nuevamente para obtener tokens validos.
          </div>
        )}
        {error && <div className="alerta error">{error}</div>}
        <button type="button" onClick={iniciarSesion}>Iniciar sesión con Cognito</button>
      </main>
    );
  }

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div>
          <p className="eyebrow">Laboratorio Cloud Native</p>
          <h1>Sesión iniciada</h1>
          <p className="intro">Prueba los servicios de identidad y las rutas publicas y protegidas.</p>
        </div>
        <button type="button" className="boton peligro" onClick={logout}>Cerrar sesión</button>
      </header>

      {error && <div className="alerta error">{error}</div>}

      <section className="panel">
        <h2>Claims de los tokens</h2>
        <Claims titulo="ID Token" token={getIdToken()} />
        <Claims titulo="Access Token" token={accessToken} />
      </section>

      <section className="panel">
        <h2>Pruebas de API</h2>
        <div className="acciones">
          {acciones.map((accion) => (
            <button
              type="button"
              key={accion.texto}
              className={accion.advertencia ? "boton advertencia" : "boton"}
              onClick={() => ejecutarAccion(accion)}
              disabled={Boolean(cargando)}
            >
              {cargando === accion.texto ? "Cargando..." : accion.texto}
            </button>
          ))}
        </div>
        <div className="resultados">
          {acciones.map((accion) => (
            <Resultado key={accion.texto} resultado={resultados[accion.texto]} />
          ))}
        </div>
      </section>
    </main>
  );
}
