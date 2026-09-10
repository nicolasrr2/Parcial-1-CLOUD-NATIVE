package cl.duoc.dsy1107.pedidos360.exception;

public class SolicitudNoEncontradaException extends RuntimeException {
    public SolicitudNoEncontradaException(Long id) {
        super("No existe la solicitud " + id);
    }
}
