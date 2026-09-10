import { useEffect, useState } from "react";
import { decidirSolicitud, listarSolicitudesPendientes } from "../api";

export default function AprobadorView({ scopes }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const puedeLeer = scopes.includes("solicitudes/read");
  const puedeAprobar = scopes.includes("solicitudes/approve");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const datos = await listarSolicitudesPendientes();
      setSolicitudes(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes pendientes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (puedeLeer) cargar();
  }, [puedeLeer]);

  async function decidir(id, decision) {
    const comentario = (comentarios[id] || "").trim();
    if (!comentario) {
      setError("El comentario es obligatorio para decidir una solicitud.");
      return;
    }
    setProcesando(id);
    setError("");
    setMensaje("");
    try {
      await decidirSolicitud(id, decision, comentario);
      setMensaje(`Solicitud #${id} ${decision.toLowerCase()} correctamente.`);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la decisión.");
    } finally {
      setProcesando(null);
    }
  }

  if (!puedeLeer) {
    return <section className="panel"><h2>Solicitudes pendientes</h2><div className="alerta advertencia">Tu token no tiene el scope solicitudes/read.</div></section>;
  }

  return (
    <section className="panel vista">
      <div className="seccion-cabecera">
        <div><p className="eyebrow">Área aprobador</p><h2>Solicitudes pendientes</h2></div>
        <button type="button" className="boton secundario" onClick={cargar} disabled={cargando}>Actualizar</button>
      </div>
      {mensaje && <div className="alerta exito">{mensaje}</div>}
      {error && <div className="alerta error">{error}</div>}
      {!puedeAprobar && <div className="alerta advertencia">Tu token no tiene el scope solicitudes/approve.</div>}
      {cargando ? <p className="texto-suave">Cargando solicitudes...</p> : solicitudes.length === 0 ? <div className="vacio">No hay solicitudes pendientes.</div> : (
        <div className="pendientes-lista">
          {solicitudes.map((solicitud) => (
            <article className="solicitud-card" key={solicitud.id}>
              <div className="solicitud-card-cabecera">
                <div><span className="eyebrow">Solicitud #{solicitud.id}</span><h3>{solicitud.tipo}</h3></div>
                <span className="badge estado-pendiente">{solicitud.estado}</span>
              </div>
              <dl className="detalle-grid">
                <div><dt>Solicitante</dt><dd>{solicitud.creadoPorEmail || solicitud.creadoPor || "No informado"}</dd></div>
                <div><dt>Fechas</dt><dd>{solicitud.fechaInicio} al {solicitud.fechaFin}</dd></div>
                <div className="campo-ancho"><dt>Motivo</dt><dd>{solicitud.motivo}</dd></div>
              </dl>
              <label>
                Comentario
                <textarea rows="3" value={comentarios[solicitud.id] || ""} onChange={(event) => setComentarios((actual) => ({ ...actual, [solicitud.id]: event.target.value }))} placeholder="Escribe el comentario de la decisión" disabled={!puedeAprobar || procesando === solicitud.id} />
              </label>
              <div className="acciones-formulario">
                <button type="button" onClick={() => decidir(solicitud.id, "APROBADA")} disabled={!puedeAprobar || procesando === solicitud.id}>Aprobar</button>
                <button type="button" className="boton peligro" onClick={() => decidir(solicitud.id, "RECHAZADA")} disabled={!puedeAprobar || procesando === solicitud.id}>Rechazar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
