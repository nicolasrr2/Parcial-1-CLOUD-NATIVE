package cl.duoc.dsy1107.pedidos360.repository;

import cl.duoc.dsy1107.pedidos360.entity.EstadoSolicitud;
import cl.duoc.dsy1107.pedidos360.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    List<Solicitud> findByCreadoPorOrderByFechaCreacionDesc(String creadoPor);

    List<Solicitud> findByEstadoOrderByFechaCreacionAsc(EstadoSolicitud estado);
}
