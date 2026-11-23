import React, { useState } from "react";
import { UserPlus, CheckCircle } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function PersonalPage() {
  const { db, currentUser, registrarMilitar, asignarMilitarAMision, cambiarEstadoMilitar } = useNexora();

  const puedeEditar = currentUser?.rol === "Oficial de Personal";

  const [busqueda, setBusqueda] = useState("");
  const [filtroEscuadron, setFiltroEscuadron] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [rango, setRango] = useState("Capitán");
  const [especialidad, setEspecialidad] = useState("");
  const [escuadron, setEscuadron] = useState("Horizonte");
  const [formMsg, setFormMsg] = useState(null);

  const [militarSelId, setMilitarSelId] = useState(db.personal[0]?.id || "");
  const [misionSel, setMisionSel] = useState("NXR-027");
  const [rolEnMision, setRolEnMision] = useState("Piloto principal");
  const [fechaAsignacion, setFechaAsignacion] = useState("23/10/2026 · 15:00");
  const [asigMsg, setAsigMsg] = useState(null);

  const personalFiltrado = db.personal.filter((p) => {
    const matchNombre = `${p.nombres} ${p.apellidos}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchEsc = filtroEscuadron === "Todos" || p.escuadron === filtroEscuadron;
    const matchEst = filtroEstado === "Todos" || p.estado === filtroEstado;
    return matchNombre && matchEsc && matchEst;
  });

  const handleRegistrar = (e) => {
    e.preventDefault();
    const res = registrarMilitar({ nombres, apellidos, rango, especialidad, escuadron });
    if (!res.ok) {
      setFormMsg({ type: "red", text: res.error });
    } else {
      setFormMsg({ type: "green", text: "Militar registrado exitosamente en estado Disponible." });
      setNombres("");
      setApellidos("");
      setEspecialidad("");
    }
  };

  const handleAsignar = (e) => {
    e.preventDefault();
    const res = asignarMilitarAMision(militarSelId, misionSel, rolEnMision);
    if (!res.ok) {
      setAsigMsg({ type: "red", text: res.error });
    } else {
      setAsigMsg({ type: "green", text: `Asignación confirmada a misión ${misionSel}.` });
    }
  };

  const disponibles = db.personal.filter((p) => p.estado === "Disponible").length;
  const asignados = db.personal.filter((p) => p.estado === "Asignado").length;
  const noDisponibles = db.personal.filter((p) => p.estado === "No disponible").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-001 / GESTIÓN DE PERSONAL</div>
          <h1 className="page-title">Personal militar y escuadrones</h1>
          <p className="page-subtitle">
            Disponibilidad y asignaciones tácticas. Solo el personal en estado Disponible puede ser asignado.
          </p>
        </div>
        {!puedeEditar && <span className="badge badge-gray">Modo solo consulta ({currentUser?.rol})</span>}
      </div>

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Personal registrado</div>
          <div className="kpi-value">{db.personal.length}</div>
          <div className="kpi-foot">3 escuadrones activos</div>
        </div>
        <div className="card">
          <div className="kpi-label">Disponible</div>
          <div className="kpi-value">{disponibles}</div>
          <div className="kpi-foot green">Listo para despliegue</div>
        </div>
        <div className="card">
          <div className="kpi-label">Asignado</div>
          <div className="kpi-value">{asignados}</div>
          <div className="kpi-foot blue">En misiones activas</div>
        </div>
        <div className="card">
          <div className="kpi-label">No disponible</div>
          <div className="kpi-value">{noDisponibles}</div>
          <div className="kpi-foot red">Licencia / evaluación médica</div>
        </div>
      </div>

      <div className="grid-3">
        {db.escuadrones.map((esc) => (
          <div key={esc.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16 }}>{esc.nombre}</h3>
              <span className="badge badge-gray">• {esc.tipo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>{esc.total} integrantes</span>
              <strong style={{ color: "#15803d" }}>{esc.disponibles} disponibles</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Registro de personal</h3>

        <div className="grid-3" style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Buscar nombres o apellidos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroEscuadron} onChange={(e) => setFiltroEscuadron(e.target.value)}>
            <option value="Todos">Todos los escuadrones</option>
            <option value="Horizonte">Horizonte</option>
            <option value="Aurora">Aurora</option>
            <option value="Centinela">Centinela</option>
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignado">Asignado</option>
            <option value="No disponible">No disponible</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Rango</th>
                <th>Especialidad</th>
                <th>Escuadrón</th>
                <th>Estado</th>
                {puedeEditar && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {personalFiltrado.map((p) => {
                const badgeClass =
                  p.estado === "Disponible"
                    ? "badge-green"
                    : p.estado === "Asignado"
                    ? "badge-yellow"
                    : "badge-red";
                return (
                  <tr key={p.id}>
                    <td><strong>{p.nombres}</strong></td>
                    <td>{p.apellidos}</td>
                    <td>{p.rango}</td>
                    <td>{p.especialidad}</td>
                    <td>{p.escuadron}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>• {p.estado}</span>
                    </td>
                    {puedeEditar && (
                      <td>
                        <select
                          value={p.estado}
                          onChange={(e) => cambiarEstadoMilitar(p.id, e.target.value)}
                          style={{ padding: "4px 8px", fontSize: 12 }}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Asignado">Asignado</option>
                          <option value="No disponible">No disponible</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {puedeEditar && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Registrar militar</h3>
            {formMsg && <AlertBanner type={formMsg.type}>{formMsg.text}</AlertBanner>}
            <form onSubmit={handleRegistrar}>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Nombres *</label>
                  <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej. Camila" />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Ej. Torres" />
                </div>
              </div>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Rango *</label>
                  <select value={rango} onChange={(e) => setRango(e.target.value)}>
                    <option>Capitán</option>
                    <option>Teniente</option>
                    <option>Sargento</option>
                    <option>Cabo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Especialidad *</label>
                  <input
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Piloto, Sanidad, Mecánica..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Escuadrón *</label>
                <select value={escuadron} onChange={(e) => setEscuadron(e.target.value)}>
                  <option>Horizonte</option>
                  <option>Aurora</option>
                  <option>Centinela</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={16} /> Guardar registro
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Asignar a misión</h3>
            {asigMsg && <AlertBanner type={asigMsg.type}>{asigMsg.text}</AlertBanner>}
            <form onSubmit={handleAsignar}>
              <div className="form-group">
                <label>Militar seleccionado *</label>
                <select value={militarSelId} onChange={(e) => setMilitarSelId(e.target.value)}>
                  {db.personal.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombreCompleto} · ({p.estado})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Misión *</label>
                  <select value={misionSel} onChange={(e) => setMisionSel(e.target.value)}>
                    {db.misiones
                      .filter((m) => m.estado !== "Completada" && m.estado !== "Abortada")
                      .map((m) => (
                        <option key={m.codigo} value={m.codigo}>
                          {m.codigo} · {m.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rol en misión *</label>
                  <select value={rolEnMision} onChange={(e) => setRolEnMision(e.target.value)}>
                    <option>Piloto principal</option>
                    <option>Copiloto</option>
                    <option>Técnico de vuelo</option>
                    <option>Enlace sanitario</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Fecha *</label>
                <input value={fechaAsignacion} onChange={(e) => setFechaAsignacion(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">
                <CheckCircle size={16} /> Confirmar asignación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}