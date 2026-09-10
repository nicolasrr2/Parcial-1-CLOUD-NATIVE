package cl.duoc.dsy1107.pedidos360.dto;

import cl.duoc.dsy1107.pedidos360.entity.EstadoSolicitud;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DecisionRequest {

    @NotNull
    private EstadoSolicitud decision;

    @NotBlank
    private String comentario;

    public EstadoSolicitud getDecision() { return decision; }
    public void setDecision(EstadoSolicitud decision) { this.decision = decision; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
}
