import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plane, Plus, CheckCircle2, Ban } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import TacticalMap from "../components/TacticalMap";
import AlertBanner from "../components/AlertBanner";

export default function MisionDetallePage() {
  const { codigo } = useParams();
  const {
    db,
    currentUser,
    asignarUnidadAMision,
    registrarNovedadMision,
    devolverRecursosMision,
    cambiarEstadoMision,
  } = useNexora();

  const mision = db.misiones.find((m) => m.codigo === codigo);
  const puedeGestionar = currentUser?.rol === "Comandante Operativo";

  const [unidadSel, setUnidadSel] = useState(db.flota[0]?.matricula || "");
  const [novedadTexto, setNovedadTexto] = useState("");
  const [motivoAborto, setMotivoAborto] = useState("");
  const [alertaOperacion, setAlertaOperacion] = useState(null);

  if (!mision) {
    return (
      <div className="card">
        <h3>Misión no encontrada</h3>
        <Link to="/misiones" className="btn btn-secondary" style={{ marginTop: 12 }}>
          ← Volver al listado de misiones
        </Link>
      </div>
    );
  }

  const handleAsignarUnidad = () => {
    const res = asignarUnidadAMision(mision.codigo, unidadSel);
    if (!res.ok) {
      setAlertaOperacion({ type: "red", title: "Solo unidades operativas, sin excepción", text: res.error });
    } else {
      setAlertaOperacion({ type: "green", title: "Unidad vinculada", text: `Unidad ${unidadSel} asignada a ${mision.codigo}.` });
    }
  };

  const handleCambioEstado = (nuevoEstado) => {
    const res = cambiarEstadoMision(mision.codigo, nuevoEstado, motivoAborto);
    if (!res.ok) {
      setAlertaOperacion({ type: "red", title: "Validación de ciclo de vida", text: res.error });
    } else {
      setAlertaOperacion({ type: "green", title: "Estado actualizado", text: `La misión pasó a ${nuevoEstado}.` });
      setMotivoAborto("");
    }
  };

  const handleAgregarNovedad = (e) => {
    e.preventDefault();
    registrarNovedadMision(mision.codigo, novedadTexto);
    setNovedadTexto("");
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link to="/misiones" style={{ color: "#1d5bd6", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
          <ArrowLeft size={14} style={{ verticalAlign: "middle" }} /> Volver a Misiones
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div className="rf-tag">RF-003 / MISIONES / {mision.codigo}</div>
          <h1 className="page-title">{mision.nombre}</h1>
          <p className="page-subtitle">
            {mision.codigo} · {mision.objetivo}
          </p>
        </div>

        {puedeGestionar && mision.estado !== "Completada" && mision.estado !== "Abortada" && (
          <div style={{ display: "flex", gap: 10 }}>
            {mision.estado === "En Preparación" && (
              <button type="button" className="btn btn-primary" onClick={() => handleCambioEstado("En Vuelo")}>
                Iniciar vuelo
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => handleCambioEstado("Completada")}>
              <CheckCircle2 size={15} /> Cerrar misión
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge badge-blue">• {mision.estado}</span>
        {mision.riesgo === "Alto" && <span className="badge badge-red">• Alto riesgo · Acceso autorizado</span>}
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Inicio: {mision.inicio} · Fin previsto: {mision.finPrevisto}
        </span>
      </div>

      {alertaOperacion && (
        <AlertBanner type={alertaOperacion.type} title={alertaOperacion.title}>
          {alertaOperacion.text}
        </AlertBanner>
      )}

      <div className="grid-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Situación táctica</h3>
            <span className="badge badge-red">• {mision.zona} · {mision.sector}</span>
          </div>
          <TacticalMap flota={db.flota} mostrarAltoRiesgo={true} />
          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>{mision.coordenadasTexto}</div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Unidades y personal asignados</h3>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 12, color: "#64748b" }}>AERONAVES / UNIDADES:</strong>
            {mision.unidadesAsignadas.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Sin unidades asignadas aún.</p>
            ) : (
              mision.unidadesAsignadas.map((mat) => (
                <div key={mat} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                  <strong>{mat}</strong>
                  <span className="badge badge-green">• Operativo</span>
                </div>
              ))
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 12, color: "#64748b" }}>PERSONAL ASIGNADO:</strong>
            {mision.personalAsignado.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Sin tripulación vinculada.</p>
            ) : (
              mision.personalAsignado.map((per, idx) => (
                <div key={idx} style={{ fontSize: 13, padding: "4px 0" }}>• {per}</div>
              ))
            )}
          </div>

          {puedeGestionar && (
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Asignar unidad adicional (Valida estado operativo RF-006)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={unidadSel} onChange={(e) => setUnidadSel(e.target.value)} style={{ flex: 1 }}>
                  {db.flota.map((u) => (
                    <option key={u.matricula} value={u.matricula}>
                      {u.matricula} · {u.tipo} ({u.estado})
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-primary" onClick={handleAsignarUnidad}>
                  <Plane size={15} /> Asignar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Bitácora de misión</h3>
          <div className="table-wrapper" style={{ marginBottom: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Novedad</th>
                  <th>Operador</th>
                </tr>
              </thead>
              <tbody>
                {mision.bitacora.map((b, i) => (
                  <tr key={i}>
                    <td><strong>{b.hora}</strong></td>
                    <td>{b.novedad}</td>
                    <td>{b.operador}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleAgregarNovedad} style={{ display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1 }}
              placeholder="Describa la novedad observada..."
              value={novedadTexto}
              onChange={(e) => setNovedadTexto(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={15} /> Registrar novedad
            </button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Paz y salvo de recursos</h3>
            {mision.tieneRecursosPendientes && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => devolverRecursosMision(mision.codigo)}
              >
                Confirmar devolución total
              </button>
            )}
          </div>

          {mision.recursosPendientes.length === 0 ? (
            <AlertBanner type="green">Sin recursos pendientes por reconciliar.</AlertBanner>
          ) : (
            <>
              <div className="table-wrapper" style={{ marginBottom: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Recurso</th>
                      <th>Entregado</th>
                      <th>Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mision.recursosPendientes.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.recurso}</strong></td>
                        <td>{r.entregado}</td>
                        <td style={{ color: r.pendiente > 0 ? "#b91c1c" : "#15803d", fontWeight: 700 }}>
                          {r.pendiente} {r.unidad}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mision.tieneRecursosPendientes ? (
                <AlertBanner type="red" title="No se puede completar: hay recursos pendientes por devolver">
                  Cierre bloqueado hasta confirmar el paz y salvo completo.
                </AlertBanner>
              ) : (
                <AlertBanner type="green">Paz y salvo completo. Misión lista para cierre.</AlertBanner>
              )}
            </>
          )}

          {puedeGestionar && mision.estado !== "Completada" && mision.estado !== "Abortada" && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", display: "block", marginBottom: 6 }}>
                Abortar misión (Motivo obligatorio)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="Describa el motivo del aborto..."
                  value={motivoAborto}
                  onChange={(e) => setMotivoAborto(e.target.value)}
                />
                <button type="button" className="btn btn-danger" onClick={() => handleCambioEstado("Abortada")}>
                  <Ban size={15} /> Confirmar aborto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}