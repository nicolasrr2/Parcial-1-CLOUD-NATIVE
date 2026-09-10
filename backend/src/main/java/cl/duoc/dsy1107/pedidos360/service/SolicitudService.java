package cl.duoc.dsy1107.pedidos360.service;

import cl.duoc.dsy1107.pedidos360.dto.DecisionRequest;
import cl.duoc.dsy1107.pedidos360.dto.SolicitudRequest;
import cl.duoc.dsy1107.pedidos360.dto.SolicitudResponse;
import cl.duoc.dsy1107.pedidos360.entity.EstadoSolicitud;
import cl.duoc.dsy1107.pedidos360.entity.Solicitud;
import cl.duoc.dsy1107.pedidos360.exception.AccesoSolicitudException;
import cl.duoc.dsy1107.pedidos360.exception.ReglaNegocioException;
import cl.duoc.dsy1107.pedidos360.exception.SolicitudNoEncontradaException;
import cl.duoc.dsy1107.pedidos360.repository.SolicitudRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class SolicitudService {

    private final SolicitudRepository repository;

    public SolicitudService(SolicitudRepository repository) {
        this.repository = repository;
    }

    public SolicitudResponse crear(SolicitudRequest request, String subject, String email) {
        Solicitud solicitud = new Solicitud();
        copiarDatos(request, solicitud);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setCreadoPor(subject);
        solicitud.setCreadoPorEmail(email);
        return SolicitudResponse.desde(repository.save(solicitud));
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarMias(String subject) {
        return repository.findByCreadoPorOrderByFechaCreacionDesc(subject).stream()
                .map(SolicitudResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPendientes() {
        return repository.findByEstadoOrderByFechaCreacionAsc(EstadoSolicitud.PENDIENTE).stream()
                .map(SolicitudResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public SolicitudResponse buscar(Long id, Authentication authentication) {
        Solicitud solicitud = obtener(id);
        verificarAccesoLectura(solicitud, authentication);
        return SolicitudResponse.desde(solicitud);
    }

    public SolicitudResponse actualizar(Long id, SolicitudRequest request, String subject) {
        Solicitud solicitud = obtener(id);
        verificarPropietario(solicitud, subject);
        verificarPendiente(solicitud);
        copiarDatos(request, solicitud);
        return SolicitudResponse.desde(solicitud);
    }

    public void eliminar(Long id, String subject) {
        Solicitud solicitud = obtener(id);
        verificarPropietario(solicitud, subject);
        verificarPendiente(solicitud);
        repository.delete(solicitud);
    }

    public SolicitudResponse decidir(Long id, DecisionRequest request) {
        if (request.getDecision() != EstadoSolicitud.APROBADA && request.getDecision() != EstadoSolicitud.RECHAZADA) {
            throw new ReglaNegocioException("La decision debe ser APROBADA o RECHAZADA");
        }
        Solicitud solicitud = obtener(id);
        verificarPendiente(solicitud);
        solicitud.setEstado(request.getDecision());
        solicitud.setComentarioAprobador(request.getComentario().trim());
        return SolicitudResponse.desde(solicitud);
    }

    private Solicitud obtener(Long id) {
        return repository.findById(id).orElseThrow(() -> new SolicitudNoEncontradaException(id));
    }

    private void verificarPendiente(Solicitud solicitud) {
        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new ReglaNegocioException("Solo se permiten cambios sobre solicitudes PENDIENTE");
        }
    }

    private void verificarPropietario(Solicitud solicitud, String subject) {
        if (!solicitud.getCreadoPor().equals(subject)) {
            throw new AccesoSolicitudException();
        }
    }

    private void verificarAccesoLectura(Solicitud solicitud, Authentication authentication) {
        boolean aprobador = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_APROBADORES"));
        if (!aprobador && !solicitud.getCreadoPor().equals(authentication.getName())) {
            throw new AccesoSolicitudException();
        }
    }

    private void copiarDatos(SolicitudRequest request, Solicitud solicitud) {
        solicitud.setTipo(request.getTipo().trim());
        solicitud.setFechaInicio(request.getFechaInicio());
        solicitud.setFechaFin(request.getFechaFin());
        solicitud.setMotivo(request.getMotivo().trim());
    }
}
