package cl.duoc.dsy1107.pedidos360.exception;

public class AccesoSolicitudException extends RuntimeException {
    public AccesoSolicitudException() {
        super("No tiene permisos para acceder a esta solicitud");
    }
}
