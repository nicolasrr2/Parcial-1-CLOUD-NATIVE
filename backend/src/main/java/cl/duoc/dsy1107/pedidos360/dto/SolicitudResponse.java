package cl.duoc.dsy1107.pedidos360.dto;

import cl.duoc.dsy1107.pedidos360.entity.EstadoSolicitud;
import cl.duoc.dsy1107.pedidos360.entity.Solicitud;
import java.time.Instant;
import java.time.LocalDate;

public record SolicitudResponse(
        Long id,
        String tipo,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String motivo,
        EstadoSolicitud estado,
        String comentarioAprobador,
        String creadoPor,
        String creadoPorEmail,
        Instant fechaCreacion,
        Instant fechaActualizacion) {

    public static SolicitudResponse desde(Solicitud solicitud) {
        return new SolicitudResponse(solicitud.getId(), solicitud.getTipo(), solicitud.getFechaInicio(),
                solicitud.getFechaFin(), solicitud.getMotivo(), solicitud.getEstado(),
                solicitud.getComentarioAprobador(), solicitud.getCreadoPor(), solicitud.getCreadoPorEmail(),
                solicitud.getFechaCreacion(), solicitud.getFechaActualizacion());
    }
}
