import React from "react";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import TacticalMap from "../components/TacticalMap";
import AlertBanner from "../components/AlertBanner";

export default function TableroPage() {
  const { db, currentUser } = useNexora();

  const esComandante =
    currentUser?.rol === "Comandante General" || currentUser?.rol === "Comandante Operativo";

  const misionesActivas = db.misiones.filter(
    (m) => m.estado === "En Vuelo" || m.estado === "En Preparación"
  );
  const enVueloCount = db.misiones.filter((m) => m.estado === "En Vuelo").length;
  const enPrepCount = db.misiones.filter((m) => m.estado === "En Preparación").length;

  const disponibles = db.personal.filter((p) => p.estado === "Disponible").length;
  const asignados = db.personal.filter((p) => p.estado === "Asignado").length;
  const noDisponibles = db.personal.filter((p) => p.estado === "No disponible").length;

  const insumosCriticos = db.insumos.filter((i) => i.esCritico);
  const unidadSinSenal = db.flota.find((u) => u.sinSenalSegundos > 30);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-004 / VISIÓN DE COMANDO</div>
          <h1 className="page-title">Panorama operacional</h1>
          <p className="page-subtitle">
            Vista consolidada de misiones, recursos y disponibilidad en tiempo real.
          </p>
        </div>
        <span className={`badge ${esComandante ? "badge-blue" : "badge-gray"}`}>
          • {esComandante ? "Vista completa · Zonas de alto riesgo" : `Vista acotada · ${currentUser?.rol}`}
        </span>
      </div>

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Misiones activas</div>
          <div className="kpi-value">0{misionesActivas.length}</div>
          <div className="kpi-foot blue">
            {enVueloCount} En Vuelo · {enPrepCount} En Preparación
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Unidades en seguimiento</div>
          <div className="kpi-value">02</div>
          <div className="kpi-foot">1 con señal · 1 sin señal</div>
        </div>

        <div className="card">
          <div className="kpi-label">Personal disponible</div>
          <div className="kpi-value">
            {disponibles}/{db.personal.length}
          </div>
          <div className="kpi-foot">
            {asignados} asignados · {noDisponibles} no disponibles
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Insumos críticos</div>
          <div className="kpi-value">0{insumosCriticos.length}</div>
          <div className="kpi-foot red">
            {insumosCriticos.map((i) => i.nombre).join(" · ") || "Sin alertas"}
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                SECTOR DE SIMULACIÓN / CUADRANTES LOCALES
              </div>
              <h3 style={{ fontSize: 16 }}>Mapa operacional</h3>
            </div>
            <span className="badge badge-green">
              <Radio size={13} /> Tiempo real · Sincronizado
            </span>
          </div>

          <TacticalMap flota={db.flota} mostrarAltoRiesgo={esComandante} />

          {unidadSinSenal && (
            <div style={{ marginTop: 14 }}>
              <AlertBanner
                type="yellow"
                title={`${unidadSinSenal.matricula} · Sin señal / Última posición conocida`}
              >
                {unidadSinSenal.sinSenalSegundos} s sin coordenadas (Umbral de alerta: &gt; 30 s) · Cuadrante{" "}
                {unidadSinSenal.cuadrante} · Misión {unidadSinSenal.misionActual}.
              </AlertBanner>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3>Misiones activas</h3>
              <Link to="/misiones" style={{ color: "#1d5bd6", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                Ver todas →
              </Link>
            </div>

            {misionesActivas.map((m) => (
              <div
                key={m.codigo}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Link
                    to={`/misiones/${m.codigo}`}
                    style={{ fontWeight: 700, color: "#0f172a", textDecoration: "none" }}
                  >
                    {m.codigo}
                  </Link>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{m.nombre}</div>
                </div>
                <span className={`badge ${m.estado === "En Vuelo" ? "badge-blue" : "badge-yellow"}`}>
                  • {m.estado}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Stock crítico</h3>
            {insumosCriticos.map((ins) => {
              const pct = Math.min(100, Math.round((ins.stockActual / ins.stockMinimo) * 100));
              return (
                <div key={ins.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <strong>{ins.nombre}</strong>
                    <span style={{ color: "#b91c1c", fontWeight: 600 }}>
                      {ins.stockActual.toLocaleString()} / {ins.stockMinimo.toLocaleString()} {ins.unidad}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: "#ef4444" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}