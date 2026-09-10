import { useEffect, useState } from "react";
import { actualizarSolicitud, crearSolicitud, eliminarSolicitud, listarMisSolicitudes } from "../api";
import SolicitudForm from "./SolicitudForm";
import SolicitudTable from "./SolicitudTable";

export default function SolicitanteView({ scopes }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const puedeLeer = scopes.includes("solicitudes/read");
  const puedeEscribir = scopes.includes("solicitudes/write");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const datos = await listarMisSolicitudes();
      setSolicitudes(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar tus solicitudes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (puedeLeer) cargar();
  }, [puedeLeer]);

  async function guardar(datos) {
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      if (editando) {
        await actualizarSolicitud(editando.id, datos);
        setMensaje("Solicitud actualizada correctamente.");
        setEditando(null);
      } else {
        await crearSolicitud(datos);
        setMensaje("Solicitud creada correctamente.");
      }
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la solicitud.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(solicitud) {
    if (!window.confirm(`¿Eliminar la solicitud #${solicitud.id}?`)) return;
    setError("");
    setMensaje("");
    try {
      await eliminarSolicitud(solicitud.id);
      setMensaje("Solicitud eliminada correctamente.");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la solicitud.");
    }
  }

  if (!puedeLeer) {
    return <section className="panel"><h2>Mis solicitudes</h2><div className="alerta advertencia">Tu token no tiene el scope solicitudes/read.</div></section>;
  }

  return (
    <section className="panel vista">
      <div className="seccion-cabecera">
        <div><p className="eyebrow">Área solicitante</p><h2>Mis solicitudes</h2></div>
        <button type="button" className="boton secundario" onClick={cargar} disabled={cargando}>Actualizar</button>
      </div>
      {puedeEscribir && (
        <div className="subpanel">
          <h3>{editando ? "Editar solicitud" : "Nueva solicitud"}</h3>
          <SolicitudForm initialData={editando} onSubmit={guardar} onCancel={() => setEditando(null)} submitting={guardando} />
        </div>
      )}
      {!puedeEscribir && <div className="alerta advertencia">Tu token no tiene el scope solicitudes/write.</div>}
      {mensaje && <div className="alerta exito">{mensaje}</div>}
      {error && <div className="alerta error">{error}</div>}
      {cargando ? <p className="texto-suave">Cargando solicitudes...</p> : <SolicitudTable solicitudes={solicitudes} puedeEscribir={puedeEscribir} onEdit={setEditando} onDelete={eliminar} />}
    </section>
  );
}
