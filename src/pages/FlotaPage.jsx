import React, { useState } from "react";
import { Wrench, AlertTriangle } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function FlotaPage() {
  const { db, currentUser, registrarFallaFlota, cerrarOrdenMantenimiento } = useNexora();

  const puedeEditar = currentUser?.rol === "Jefe de Mantenimiento";

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [matriculaSel, setMatriculaSel] = useState("FAC-2208");

  const [descFalla, setDescFalla] = useState("");
  const [severidad, setSeveridad] = useState("Preventiva");
  const [trabajoRealizado, setTrabajoRealizado] = useState("");

  const unidadActiva = db.flota.find((u) => u.matricula === matriculaSel) || db.flota[0];

  const flotaFiltrada = db.flota.filter((u) => {
    const matchText =
      u.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.tipo.toLowerCase().includes(busqueda.toLowerCase());
    const matchEst = filtroEstado === "Todos" || u.estado === filtroEstado;
    return matchText && matchEst;
  });

  const handleGuardarFalla = (e) => {
    e.preventDefault();
    registrarFallaFlota(unidadActiva.matricula, descFalla, severidad);
    setDescFalla("");
  };

  const handleCerrarOrden = (idOrden) => {
    cerrarOrdenMantenimiento(unidadActiva.matricula, idOrden, trabajoRealizado);
    setTrabajoRealizado("");
  };

  const badgeFlota = (estado) => {
    if (estado === "Operativo") return "badge-green";
    if (estado === "En Mantenimiento") return "badge-yellow";
    return "badge-red";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-006 / CONTROL TÉCNICO</div>
          <h1 className="page-title">Flota y mantenimiento</h1>
          <p className="page-subtitle">
            Disponibilidad técnica, intervenciones y órdenes preventivas. Solo las unidades operativas pueden asignarse a misiones.
          </p>
        </div>
      </div>

      <AlertBanner
        type="yellow"
        title="Mantenimiento preventivo automático · FAC-2208 alcanzó 100,0 horas"
      >
        Asignación bloqueada. Orden OM-041 generada tras reintento y notificada al Tte. Oscar Morales.
      </AlertBanner>

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Unidades registradas</div>
          <div className="kpi-value">0{db.flota.length}</div>
          <div className="kpi-foot">3 helicópteros · 2 aviones</div>
        </div>
        <div className="card">
          <div className="kpi-label">Operativo</div>
          <div className="kpi-value">0{db.flota.filter((u) => u.estado === "Operativo").length}</div>
          <div className="kpi-foot green">Disponibles para misión</div>
        </div>
        <div className="card">
          <div className="kpi-label">En Mantenimiento</div>
          <div className="kpi-value">0{db.flota.filter((u) => u.estado === "En Mantenimiento").length}</div>
          <div className="kpi-foot">Preventivo de 100 h</div>
        </div>
        <div className="card">
          <div className="kpi-label">Fuera de Servicio</div>
          <div className="kpi-value">0{db.flota.filter((u) => u.estado === "Fuera de Servicio").length}</div>
          <div className="kpi-foot red">Bloqueo absoluto</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Registro de flota</h3>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <input
              placeholder="Buscar matrícula o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="Todos">Todos los estados</option>
              <option value="Operativo">Operativo</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Fuera de Servicio">Fuera de Servicio</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Horas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {flotaFiltrada.map((u) => (
                  <tr
                    key={u.matricula}
                    onClick={() => setMatriculaSel(u.matricula)}
                    style={{
                      cursor: "pointer",
                      background: u.matricula === unidadActiva.matricula ? "#eff6ff" : undefined,
                    }}
                  >
                    <td>
                      <strong style={{ color: "#1d5bd6" }}>{u.matricula}</strong>
                    </td>
                    <td>{u.tipo}</td>
                    <td>{u.horasVuelo.toFixed(1)} h</td>
                    <td>
                      <span className={`badge ${badgeFlota(u.estado)}`}>• {u.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                {unidadActiva.tipo.toUpperCase()} / {unidadActiva.horasVuelo.toFixed(1)} H
              </div>
              <h3>{unidadActiva.matricula}</h3>
            </div>
            <span className={`badge ${badgeFlota(unidadActiva.estado)}`}>• {unidadActiva.estado}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 12, color: "#64748b" }}>ÓRDENES DE MANTENIMIENTO:</strong>
            {unidadActiva.ordenes.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Sin órdenes activas.</p>
            ) : (
              unidadActiva.ordenes.map((ord) => (
                <div
                  key={ord.idOrden}
                  style={{
                    padding: 12,
                    background: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    marginTop: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>
                      {ord.idOrden} · {ord.tipo}
                    </strong>
                    <span className={`badge ${ord.estado === "Cerrada" ? "badge-green" : "badge-yellow"}`}>
                      • {ord.estado}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, margin: "6px 0" }}>{ord.descripcion}</p>
                  {puedeEditar && ord.estado !== "Cerrada" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        style={{ flex: 1 }}
                        placeholder="Trabajo realizado..."
                        value={trabajoRealizado}
                        onChange={(e) => setTrabajoRealizado(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleCerrarOrden(ord.idOrden)}
                      >
                        <Wrench size={14} /> Cerrar orden
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div>
            <strong style={{ fontSize: 12, color: "#64748b" }}>HISTORIAL TÉCNICO:</strong>
            {unidadActiva.historial.map((h, i) => (
              <div key={i} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <strong>{h.fecha}</strong> — {h.detalle}
              </div>
            ))}
          </div>
        </div>
      </div>

      {puedeEditar && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Registrar falla en {unidadActiva.matricula}</h3>
          <form onSubmit={handleGuardarFalla} className="grid-3">
            <input
              placeholder="Describa la falla observada..."
              value={descFalla}
              onChange={(e) => setDescFalla(e.target.value)}
              required
            />
            <select value={severidad} onChange={(e) => setSeveridad(e.target.value)}>
              <option value="Preventiva">Preventiva (En Mantenimiento)</option>
              <option value="Media">Correctiva Media (En Mantenimiento)</option>
              <option value="Crítica">Crítica (Fuera de Servicio)</option>
            </select>
            <button type="submit" className="btn btn-primary">
              <AlertTriangle size={15} /> Guardar falla y bloquear unidad
            </button>
          </form>
        </div>
      )}
    </div>
  );
}