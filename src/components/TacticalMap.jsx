import React from "react";
import { Flag, Plane, AlertTriangle } from "lucide-react";

const CUADRANTES = ["A-1", "B-1", "C-1", "A-2", "B-2", "C-2", "A-3", "B-3", "C-3"];

export default function TacticalMap({ flota, mostrarAltoRiesgo }) {
  const unidadesEnVuelo = flota.filter((u) => u.misionActual);

  return (
    <div>
      <div className="tactical-map">
        {CUADRANTES.map((c) => (
          <div key={c} className="quadrant-cell">{c}</div>
        ))}

        {mostrarAltoRiesgo && (
          <div className="high-risk-zone">
            <span className="high-risk-tag">
              <AlertTriangle size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
              ALTO RIESGO · C-2
            </span>
          </div>
        )}

        <div className="map-marker" style={{ left: "26%", top: "76%" }}>
          <div className="marker-dot base"><Flag size={14} /></div>
          <div className="marker-card">
            <strong>BASE HORIZONTE</strong>
            <div style={{ color: "#64748b", fontSize: 10 }}>Centro logístico</div>
          </div>
        </div>

        {unidadesEnVuelo.map((u) => {
          const sinSenal = u.sinSenalSegundos > 30;
          return (
            <div key={u.matricula} className="map-marker" style={{ left: `${u.coords.x}%`, top: `${u.coords.y}%` }}>
              <div className={`marker-dot ${sinSenal ? "warn" : "ok"}`}><Plane size={14} /></div>
              <div className="marker-card">
                <strong>{u.matricula}</strong>
                <div style={{ color: sinSenal ? "#b45309" : "#1d5bd6", fontSize: 10 }}>
                  {sinSenal ? `Sin señal · ${u.sinSenalSegundos} s` : `${u.misionActual} · En Vuelo`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "#475569", flexWrap: "wrap" }}>
        <span>🔵 Unidad con señal</span>
        <span>🟡 Última posición (&gt;30s sin señal)</span>
        {mostrarAltoRiesgo && <span>🔴 Alto riesgo autorizado (Comandantes)</span>}
      </div>
    </div>
  );
}