import { useEffect, useState } from "react";

const vacio = { tipo: "", fechaInicio: "", fechaFin: "", motivo: "" };

export default function SolicitudForm({ initialData, onSubmit, onCancel, submitting }) {
  const [formulario, setFormulario] = useState(initialData || vacio);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormulario(initialData || vacio);
    setError("");
  }, [initialData]);

  function cambiar(event) {
    setFormulario((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  }

  async function enviar(event) {
    event.preventDefault();
    if (!formulario.tipo || !formulario.fechaInicio || !formulario.fechaFin || !formulario.motivo.trim()) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    if (formulario.fechaFin < formulario.fechaInicio) {
      setError("La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }
    setError("");
    await onSubmit({ ...formulario, motivo: formulario.motivo.trim() });
  }

  return (
    <form className="solicitud-form" onSubmit={enviar}>
      <div className="formulario-grid">
        <label>
          Tipo
          <input name="tipo" value={formulario.tipo} onChange={cambiar} placeholder="Ej. Vacaciones" required />
        </label>
        <label>
          Fecha inicio
          <input type="date" name="fechaInicio" value={formulario.fechaInicio} onChange={cambiar} required />
        </label>
        <label>
          Fecha fin
          <input type="date" name="fechaFin" value={formulario.fechaFin} onChange={cambiar} required />
        </label>
        <label className="campo-ancho">
          Motivo
          <textarea name="motivo" value={formulario.motivo} onChange={cambiar} rows="3" required />
        </label>
      </div>
      {error && <p className="formulario-error">{error}</p>}
      <div className="acciones-formulario">
        <button type="submit" disabled={submitting}>{submitting ? "Guardando..." : initialData ? "Guardar cambios" : "Crear solicitud"}</button>
        {initialData && <button type="button" className="boton secundario" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}
