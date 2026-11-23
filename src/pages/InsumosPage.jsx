import React, { useState } from "react";
import { Send, Plus } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function InsumosPage() {
  const { db, currentUser, procesarDespacho, registrarInsumo } = useNexora();

  const puedeEditar = currentUser?.rol === "Logístico";

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const [insumoId, setInsumoId] = useState(db.insumos[0]?.id || "");
  const [cantidad, setCantidad] = useState(600);
  const [misionCodigo, setMisionCodigo] = useState("NXR-027");
  const [despachoFeedback, setDespachoFeedback] = useState(null);

  const [showNuevo, setShowNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCat, setNuevaCat] = useState("Combustible");
  const [nuevoStock, setNuevoStock] = useState(1000);
  const [nuevoMin, setNuevoMin] = useState(300);
  const [nuevaUnidad, setNuevaUnidad] = useState("L");

  const insumoSeleccionado = db.insumos.find((i) => i.id === insumoId);
  const saldoProyectado = insumoSeleccionado ? insumoSeleccionado.stockActual - Number(cantidad || 0) : 0;

  const insumosFiltrados = db.insumos.filter((i) => {
    const matchName = i.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = categoria === "Todas" || i.categoria === categoria;
    return matchName && matchCat;
  });

  const criticos = db.insumos.filter((i) => i.esCritico);

  const handleDespacho = (e) => {
    e.preventDefault();
    const res = procesarDespacho(insumoId, Number(cantidad), misionCodigo);
    if (!res.ok) {
      setDespachoFeedback({ type: "red", title: "Saldo insuficiente", text: res.error });
    } else {
      setDespachoFeedback({
        type: res.alertaCritica ? "yellow" : "green",
        title: res.alertaCritica ? "Despacho procesado con ALERTA DE STOCK CRÍTICO" : "Despacho procesado",
        text: `Se descontaron ${cantidad} ${insumoSeleccionado?.unidad} para la misión ${misionCodigo}.`,
      });
    }
  };

  const handleCrearInsumo = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    registrarInsumo({
      nombre: nuevoNombre,
      categoria: nuevaCat,
      stockActual: nuevoStock,
      stockMinimo: nuevoMin,
      unidad: nuevaUnidad,
    });
    setNuevoNombre("");
    setShowNuevo(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-002 / ABASTECIMIENTO</div>
          <h1 className="page-title">Insumos críticos y despachos</h1>
          <p className="page-subtitle">
            Controle existencias, umbrales mínimos y entregas por misión. Centro logístico Horizonte.
          </p>
        </div>

        {puedeEditar && (
          <button type="button" className="btn btn-primary" onClick={() => setShowNuevo(!showNuevo)}>
            <Plus size={16} /> Registrar insumo
          </button>
        )}
      </div>

      {criticos.length > 0 && (
        <AlertBanner
          type="red"
          title={`Riesgo alto · ${criticos[0].nombre} por debajo del mínimo`}
        >
          Stock actual: {criticos[0].stockActual.toLocaleString()} {criticos[0].unidad} / mínimo:{" "}
          {criticos[0].stockMinimo.toLocaleString()} {criticos[0].unidad} · Requiere reabastecimiento inmediato.
        </AlertBanner>
      )}

      {showNuevo && puedeEditar && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Nuevo insumo crítico</h3>
          <form onSubmit={handleCrearInsumo} className="grid-3">
            <input
              placeholder="Nombre del insumo..."
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              required
            />
            <select value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
              <option>Combustible</option>
              <option>Armamento</option>
            </select>
            <input
              type="number"
              placeholder="Stock inicial"
              value={nuevoStock}
              onChange={(e) => setNuevoStock(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Stock mínimo"
              value={nuevoMin}
              onChange={(e) => setNuevoMin(e.target.value)}
              required
            />
            <select value={nuevaUnidad} onChange={(e) => setNuevaUnidad(e.target.value)}>
              <option value="L">Litros (L)</option>
              <option value="un.">Unidades (un.)</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Guardar insumo
            </button>
          </form>
        </div>
      )}

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Referencias activas</div>
          <div className="kpi-value">0{db.insumos.length}</div>
          <div className="kpi-foot">Combustible y armamento</div>
        </div>
        <div className="card">
          <div className="kpi-label">Insumos en nivel crítico</div>
          <div className="kpi-value">0{criticos.length}</div>
          <div className="kpi-foot red">En mínimo o por debajo</div>
        </div>
        <div className="card">
          <div className="kpi-label">Solicitudes pendientes</div>
          <div className="kpi-value">
            0{db.solicitudesDespacho.filter((s) => s.estado === "Pendiente").length}
          </div>
          <div className="kpi-foot">Por reconciliar en misión</div>
        </div>
        <div className="card">
          <div className="kpi-label">Movimientos registrados</div>
          <div className="kpi-value">{db.solicitudesDespacho.length + 9}</div>
          <div className="kpi-foot">Sin existencias negativas</div>
        </div>
      </div>

      <div className={puedeEditar ? "grid-2-1" : ""}>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Inventario de insumos</h3>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <input
              placeholder="Buscar nombre del insumo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="Todas">Todas las categorías</option>
              <option value="Combustible">Combustible</option>
              <option value="Armamento">Armamento</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Stock actual</th>
                  <th>Mínimo</th>
                  <th>Nivel de stock</th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map((ins) => (
                  <tr key={ins.id}>
                    <td><strong>{ins.nombre}</strong></td>
                    <td>{ins.categoria}</td>
                    <td style={{ color: ins.esCritico ? "#b91c1c" : "#0f172a", fontWeight: 700 }}>
                      {ins.stockActual.toLocaleString()} {ins.unidad}
                    </td>
                    <td>{ins.stockMinimo.toLocaleString()} {ins.unidad}</td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: ins.esCritico ? "#b91c1c" : "#15803d" }}>
                        {ins.esCritico ? "Crítico · reabastecer" : "Dentro del umbral"}
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${ins.porcentajeNivel}%`,
                            background: ins.esCritico ? "#ef4444" : "#16a34a",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {puedeEditar && (
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Solicitud de despacho</h3>
            {despachoFeedback && (
              <AlertBanner type={despachoFeedback.type} title={despachoFeedback.title}>
                {despachoFeedback.text}
              </AlertBanner>
            )}
            <form onSubmit={handleDespacho}>
              <div className="form-group">
                <label>Insumo *</label>
                <select value={insumoId} onChange={(e) => setInsumoId(e.target.value)}>
                  {db.insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} (Disp: {i.stockActual.toLocaleString()} {i.unidad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Unidad</label>
                  <input value={insumoSeleccionado?.unidad || ""} disabled />
                </div>
              </div>

              <div className="form-group">
                <label>Misión destino *</label>
                <select value={misionCodigo} onChange={(e) => setMisionCodigo(e.target.value)}>
                  {db.misiones
                    .filter((m) => m.estado !== "Completada" && m.estado !== "Abortada")
                    .map((m) => (
                      <option key={m.codigo} value={m.codigo}>
                        {m.codigo} · {m.nombre}
                      </option>
                    ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ color: "#64748b" }}>Saldo proyectado</span>
                <strong style={{ color: saldoProyectado < 0 ? "#b91c1c" : "#0f172a" }}>
                  {saldoProyectado.toLocaleString()} {insumoSeleccionado?.unidad}
                </strong>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                <Send size={15} /> Procesar despacho
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Solicitudes recientes</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Misión</th>
                <th>Estado</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {db.solicitudesDespacho.map((sol) => (
                <tr key={sol.id}>
                  <td><strong>{sol.id}</strong></td>
                  <td>{sol.insumoNombre}</td>
                  <td>{sol.cantidad.toLocaleString()} {sol.unidad}</td>
                  <td>{sol.misionCodigo}</td>
                  <td>
                    <span className={`badge ${sol.estado === "Procesado" ? "badge-green" : "badge-yellow"}`}>
                      • {sol.estado}
                    </span>
                  </td>
                  <td>{sol.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}