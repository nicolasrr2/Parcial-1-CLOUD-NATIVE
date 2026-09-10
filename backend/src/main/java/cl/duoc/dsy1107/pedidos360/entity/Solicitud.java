package cl.duoc.dsy1107.pedidos360.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false, columnDefinition = "text")
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado;

    @Column(columnDefinition = "text")
    private String comentarioAprobador;

    @Column(nullable = false)
    private String creadoPor;

    private String creadoPorEmail;

    @Column(nullable = false, updatable = false)
    private Instant fechaCreacion;

    @Column(nullable = false)
    private Instant fechaActualizacion;

    @PrePersist
    void alCrear() {
        Instant ahora = Instant.now();
        fechaCreacion = ahora;
        fechaActualizacion = ahora;
    }

    @PreUpdate
    void alActualizar() {
        fechaActualizacion = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }
    public String getComentarioAprobador() { return comentarioAprobador; }
    public void setComentarioAprobador(String comentarioAprobador) { this.comentarioAprobador = comentarioAprobador; }
    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }
    public String getCreadoPorEmail() { return creadoPorEmail; }
    public void setCreadoPorEmail(String creadoPorEmail) { this.creadoPorEmail = creadoPorEmail; }
    public Instant getFechaCreacion() { return fechaCreacion; }
    public Instant getFechaActualizacion() { return fechaActualizacion; }
}
