import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function MisionesPage() {
  const { db, currentUser, crearMision } = useNexora();

  const esComandante =
    currentUser?.rol === "Comandante General" || currentUser?.rol === "Comandante Operativo";
  const puedeCrear = currentUser?.rol === "Comandante Operativo";

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroEscuadron, setFiltroEscuadron] = useState("Todos");

  const [showCrear, setShowCrear] = useState(false);
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [escuadron, setEscuadron] = useState("Horizonte");
  const [zona, setZona] = useState("B-1");
  const [riesgo, setRiesgo] = useState("Medio");

  const misionesVisibles = db.misiones.filter((m) => {
    if (m.riesgo === "Alto" && !esComandante) return false;
    const matchText =
      m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.objetivo.toLowerCase().includes(busqueda.toLowerCase());
    const matchEst = filtroEstado === "Todos" || m.estado === filtroEstado;
    const matchEsc = filtroEscuadron === "Todos" || m.escuadron === filtroEscuadron;
    return matchText && matchEst && matchEsc;
  });

  const handleCrearMision = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !objetivo.trim()) return;
    crearMision({ nombre, objetivo, escuadron, zona, riesgo });
    setNombre("");
    setObjetivo("");
    setShowCrear(false);
  };

  const badgeEstado = (estado) => {
    if (estado === "En Vuelo") return "badge-blue";
    if (estado === "En Preparación") return "badge-yellow";
    if (estado === "Completada") return "badge-green";
    return "badge-red";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-003 / COMANDO OPERATIVO</div>
          <h1 className="page-title">Misiones</h1>
          <p className="page-subtitle">
            Planifique, asigne unidades y gestione el ciclo de vida de cada misión.
          </p>
        </div>

        {puedeCrear && (
          <button type="button" className="btn btn-primary" onClick={() => setShowCrear(!showCrear)}>
            <Plus size={16} /> Crear misión
          </button>
        )}
      </div>

      {showCrear && puedeCrear && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Nueva misión táctica</h3>
          <form onSubmit={handleCrearMision} className="grid-3">
            <input
              placeholder="Nombre clave (ej. Halcón Sur)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              placeholder="Objetivo operacional..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              required
            />
            <select value={escuadron} onChange={(e) => setEscuadron(e.target.value)}>
              <option>Horizonte</option>
              <option>Aurora</option>
              <option>Centinela</option>
            </select>
            <select value={zona} onChange={(e) => setZona(e.target.value)}>
              <option value="A-1">Cuadrante A-1</option>
              <option value="B-1">Cuadrante B-1</option>
              <option value="C-1">Cuadrante C-1</option>
              <option value="C-2">Cuadrante C-2</option>
            </select>
            <select value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
              <option value="Bajo">Riesgo Bajo</option>
              <option value="Medio">Riesgo Medio</option>
              <option value="Alto">Riesgo Alto (Solo Comandantes)</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Registrar misión
            </button>
          </form>
        </div>
      )}

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Misiones activas</div>
          <div className="kpi-value">
            0{misionesVisibles.filter((m) => m.estado === "En Vuelo" || m.estado === "En Preparación").length}
          </div>
          <div className="kpi-foot blue">En Vuelo y En Preparación</div>
        </div>
        <div className="card">
          <div className="kpi-label">Unidades asignadas</div>
          <div className="kpi-value">02</div>
          <div className="kpi-foot">FAC-1234 · FAC-2041</div>
        </div>
        <div className="card">
          <div className="kpi-label">Completadas del periodo</div>
          <div className="kpi-value">
            0{misionesVisibles.filter((m) => m.estado === "Completada").length}
          </div>
          <div className="kpi-foot green">Recursos devueltos en su totalidad</div>
        </div>
        <div className="card">
          <div className="kpi-label">Abortadas del periodo</div>
          <div className="kpi-value">
            0{misionesVisibles.filter((m) => m.estado === "Abortada").length}
          </div>
          <div className="kpi-foot red">Motivo y notificación registrados</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Registro de misiones</h3>

        <div className="grid-3" style={{ marginBottom: 14 }}>
          <input
            placeholder="Buscar código, nombre u objetivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="En Preparación">En Preparación</option>
            <option value="En Vuelo">En Vuelo</option>
            <option value="Completada">Completada</option>
            <option value="Abortada">Abortada</option>
          </select>
          <select value={filtroEscuadron} onChange={(e) => setFiltroEscuadron(e.target.value)}>
            <option value="Todos">Todos los escuadrones</option>
            <option value="Horizonte">Horizonte</option>
            <option value="Aurora">Aurora</option>
            <option value="Centinela">Centinela</option>
          </select>
        </div>

        {misionesVisibles.length === 0 ? (
          <AlertBanner type="blue">No hay misiones para el criterio seleccionado.</AlertBanner>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Misión / Objetivo</th>
                  <th>Escuadrón</th>
                  <th>Inicio / Fin</th>
                  <th>Estado</th>
                  <th>Riesgo / Zona</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {misionesVisibles.map((m) => (
                  <tr key={m.codigo}>
                    <td><strong>{m.codigo}</strong></td>
                    <td>
                      <strong>{m.nombre}</strong>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{m.objetivo}</div>
                    </td>
                    <td>{m.escuadron}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>{m.inicio}</div>
                      <div style={{ color: "#64748b" }}>{m.finReal || m.finPrevisto}</div>
                    </td>
                    <td>
                      <span className={`badge ${badgeEstado(m.estado)}`}>• {m.estado}</span>
                    </td>
                    <td>
                      <span style={{ color: m.riesgo === "Alto" ? "#b91c1c" : "#475569", fontWeight: 600 }}>
                        {m.riesgo} · {m.zona}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/misiones/${m.codigo}`}
                        style={{ color: "#1d5bd6", fontWeight: 600, textDecoration: "none" }}
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}