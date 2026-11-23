import React, { useState } from "react";
import { FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function ReportesPage() {
  const { db, currentUser, registrarAuditoria } = useNexora();

  const puedeExportar = currentUser?.rol === "Logístico";

  const [tipoReporte, setTipoReporte] = useState("Insumos");
  const [fechaInicio, setFechaInicio] = useState("2026-10-19");
  const [fechaFin, setFechaFin] = useState("2026-10-23");
  const [clasificacion, setClasificacion] = useState("Uso logístico · Permitido");
  const [alertaReporte, setAlertaReporte] = useState(null);

  const handleExportar = (formato) => {
    if (clasificacion === "Clasificado / Alto Riesgo" && currentUser?.rol !== "Comandante General") {
      setAlertaReporte({
        type: "red",
        title: "No tiene permisos para exportar datos clasificados",
        text: "Respuesta al seleccionar una clasificación fuera del alcance del perfil Logístico.",
      });
      return;
    }

    if (fechaInicio > fechaFin || fechaFin < "2026-10-01") {
      setAlertaReporte({
        type: "yellow",
        title: "No existen registros disponibles para el periodo seleccionado",
        text: "Seleccione otro rango de fechas para generar el archivo.",
      });
      return;
    }

    const contenido =
      tipoReporte === "Insumos"
        ? "INSUMO,CATEGORIA,STOCK_ACTUAL,MINIMO,DESPACHADO\n" +
          db.insumos.map((i) => `${i.nombre},${i.categoria},${i.stockActual},${i.stockMinimo},${i.despachadoPeriodo}`).join("\n")
        : "CODIGO,NOMBRE,ESCUADRON,ESTADO,ZONA\n" +
          db.misiones.map((m) => `${m.codigo},${m.nombre},${m.escuadron},${m.estado},${m.zona}`).join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NEXORA_REP_${tipoReporte.toUpperCase()}_${formato}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    registrarAuditoria(
      `Exportación ${formato} · ${tipoReporte}`,
      "Reportes",
      `Sin archivo → ${formato} generado`,
      { periodo: `${fechaInicio} a ${fechaFin}` },
      { formato, clasificacion }
    );

    setAlertaReporte({
      type: "green",
      title: `Reporte ${formato} generado y descargado`,
      text: "La exportación quedó registrada en la bitácora de auditoría institucional.",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-008 / ANÁLISIS Y EXPORTACIÓN</div>
          <h1 className="page-title">Reportes logísticos</h1>
          <p className="page-subtitle">
            Genere evidencia analítica de insumos o misiones según su clasificación y alcance autorizado.
          </p>
        </div>

        {puedeExportar ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => handleExportar("Excel")}>
              <FileSpreadsheet size={16} /> Generar Reporte Excel
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleExportar("PDF")}>
              <FileText size={16} /> Exportar PDF
            </button>
          </div>
        ) : (
          <span className="badge badge-gray">Solo consulta · Sin exportación ({currentUser?.rol})</span>
        )}
      </div>

      {alertaReporte && (
        <AlertBanner type={alertaReporte.type} title={alertaReporte.title}>
          {alertaReporte.text}
        </AlertBanner>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Parámetros del reporte</h3>
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label>Tipo de reporte</label>
            <select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="Insumos">Insumos</option>
              <option value="Misiones">Misiones</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha inicial</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fecha final</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Clasificación</label>
            <select value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}>
              <option>Uso logístico · Permitido</option>
              <option>Clasificado / Alto Riesgo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card">
          <div className="kpi-label">Combustible disponible</div>
          <div className="kpi-value">12.400 L</div>
          <div className="kpi-foot">Saldo consolidado de 3 referencias</div>
        </div>
        <div className="card">
          <div className="kpi-label">Volumen despachado</div>
          <div className="kpi-value">11.200 L</div>
          <div className="kpi-foot blue">Acumulado del periodo seleccionado</div>
        </div>
        <div className="card">
          <div className="kpi-label">Referencias críticas</div>
          <div className="kpi-value">02 / 05</div>
          <div className="kpi-foot red">Jet A-1 · Munición de entrenamiento</div>
        </div>
        <div className="card">
          <div className="kpi-label">Despachos del periodo</div>
          <div className="kpi-value">12</div>
          <div className="kpi-foot">Último a las 14:28</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <h3>Resumen consolidado por {tipoReporte.toLowerCase()}</h3>
          <span className="badge badge-green">
            <RefreshCw size={12} /> Vista previa lista
          </span>
        </div>

        <div className="table-wrapper">
          {tipoReporte === "Insumos" ? (
            <table>
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Stock actual</th>
                  <th>Mínimo</th>
                  <th>Despachado en periodo</th>
                </tr>
              </thead>
              <tbody>
                {db.insumos.map((i) => (
                  <tr key={i.id}>
                    <td><strong>{i.nombre}</strong></td>
                    <td>{i.stockActual.toLocaleString()} {i.unidad}</td>
                    <td>{i.stockMinimo.toLocaleString()} {i.unidad}</td>
                    <td>{i.despachadoPeriodo.toLocaleString()} {i.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Misión</th>
                  <th>Escuadrón</th>
                  <th>Estado</th>
                  <th>Zona</th>
                </tr>
              </thead>
              <tbody>
                {db.misiones.map((m) => (
                  <tr key={m.codigo}>
                    <td><strong>{m.codigo}</strong></td>
                    <td>{m.nombre}</td>
                    <td>{m.escuadron}</td>
                    <td>{m.estado}</td>
                    <td>{m.zona}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}