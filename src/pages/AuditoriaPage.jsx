import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function AuditoriaPage() {
  const { db } = useNexora();

  const [tab, setTab] = useState("accesos");
  const [filtroUsuario, setFiltroUsuario] = useState("Todos");
  const [filtroModulo, setFiltroModulo] = useState("Todos");
  const [transaccionDetalle, setTransaccionDetalle] = useState(db.logsTransacciones[0]);

  const accesosFiltrados = db.logsAcceso.filter(
    (a) => filtroUsuario === "Todos" || a.usuario === filtroUsuario
  );

  const transaccionesFiltradas = db.logsTransacciones.filter((t) => {
    const matchUser = filtroUsuario === "Todos" || t.usuario === filtroUsuario;
    const matchMod = filtroModulo === "Todos" || t.modulo === filtroModulo;
    return matchUser && matchMod;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-005 / EVIDENCIA INSTITUCIONAL</div>
          <h1 className="page-title">Auditoría de seguridad</h1>
          <p className="page-subtitle">
            Accesos y transacciones inmutables. Este perfil es exclusivamente de lectura, sin edición ni eliminación.
          </p>
        </div>
        <span className="badge badge-blue">• Solo lectura · Registros inmutables</span>
      </div>

      <AlertBanner type="blue" title="Conservación de evidencia">
        Las acciones, transacciones, accesos y exportaciones conservan usuario, marca temporal e IP. Ningún perfil, incluido el Administrador, puede alterar logs.
      </AlertBanner>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Filtrar por Usuario</label>
            <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}>
              <option value="Todos">Todos los usuarios</option>
              {db.usuarios.map((u) => (
                <option key={u.idUsuario} value={u.username}>
                  {u.username} ({u.rol})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Filtrar por Módulo</label>
            <select value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)}>
              <option value="Todos">Todos los módulos</option>
              <option value="Personal">Personal</option>
              <option value="Insumos">Insumos</option>
              <option value="Misiones">Misiones</option>
              <option value="Flota">Flota</option>
              <option value="Reportes">Reportes</option>
              <option value="Usuarios">Usuarios</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 14 }}>
          <button
            type="button"
            className={`btn ${tab === "accesos" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTab("accesos")}
          >
            Logs de acceso ({accesosFiltrados.length})
          </button>
          <button
            type="button"
            className={`btn ${tab === "transacciones" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTab("transacciones")}
          >
            Transacciones ({transaccionesFiltradas.length})
          </button>
        </div>

        {tab === "accesos" ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Usuario intentado</th>
                  <th>Evento</th>
                  <th>Resultado</th>
                  <th>IP de origen</th>
                </tr>
              </thead>
              <tbody>
                {accesosFiltrados.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.fechaHora}</td>
                    <td><strong>{acc.usuario}</strong></td>
                    <td>{acc.evento}</td>
                    <td>
                      <span className={`badge ${acc.resultado === "Exitoso" ? "badge-green" : "badge-red"}`}>
                        • {acc.resultado}
                      </span>
                    </td>
                    <td>{acc.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Módulo</th>
                  <th>IP</th>
                  <th>Anterior / Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {transaccionesFiltradas.map((trx) => (
                  <tr
                    key={trx.id}
                    onClick={() => setTransaccionDetalle(trx)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{trx.fechaHora}</td>
                    <td><strong>{trx.usuario}</strong></td>
                    <td>{trx.accion}</td>
                    <td>{trx.modulo}</td>
                    <td>{trx.ip}</td>
                    <td style={{ color: "#1d5bd6", fontWeight: 600 }}>{trx.resumenCambio} · Ver detalle</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transaccionDetalle && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3>Detalle de transacción · {transaccionDetalle.id}</h3>
            <span className="badge badge-gray">
              <ShieldAlert size={13} /> Evidencia inmutable
            </span>
          </div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>DATOS ANTERIORES</div>
              <pre style={{ fontSize: 12 }}>{JSON.stringify(transaccionDetalle.datosAnteriores, null, 2)}</pre>
            </div>
            <div style={{ background: "#eff6ff", padding: 14, borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1d5bd6", marginBottom: 6 }}>DATOS NUEVOS</div>
              <pre style={{ fontSize: 12 }}>{JSON.stringify(transaccionDetalle.datosNuevos, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}