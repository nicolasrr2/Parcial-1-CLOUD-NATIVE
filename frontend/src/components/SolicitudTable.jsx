function etiquetaEstado(estado) {
  return <span className={`badge estado-${String(estado || "").toLowerCase()}`}>{estado || "SIN ESTADO"}</span>;
}

export default function SolicitudTable({ solicitudes, puedeEscribir, onEdit, onDelete }) {
  if (!solicitudes.length) {
    return <div className="vacio">No tienes solicitudes registradas.</div>;
  }

  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Fechas</th><th>Motivo</th><th>Estado</th><th>Comentario</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((solicitud) => {
            const pendiente = solicitud.estado === "PENDIENTE";
            return (
              <tr key={solicitud.id}>
                <td data-label="ID">{solicitud.id}</td>
                <td data-label="Tipo">{solicitud.tipo}</td>
                <td data-label="Fechas">{solicitud.fechaInicio} al {solicitud.fechaFin}</td>
                <td data-label="Motivo">{solicitud.motivo}</td>
                <td data-label="Estado">{etiquetaEstado(solicitud.estado)}</td>
                <td data-label="Comentario">{solicitud.comentarioAprobador || "Sin comentario"}</td>
                <td data-label="Acciones">
                  {puedeEscribir && pendiente ? (
                    <div className="acciones-tabla">
                      <button type="button" className="boton pequeno" onClick={() => onEdit(solicitud)}>Editar</button>
                      <button type="button" className="boton pequeno peligro" onClick={() => onDelete(solicitud)}>Eliminar</button>
                    </div>
                  ) : <span className="texto-suave">Sin acciones</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
