import React from "react";
import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import { ROLES_PERMISOS } from "../services/NexoraDatabase";

export default function ForbiddenPage() {
  const { currentUser } = useNexora();
  const rutaInicio = ROLES_PERMISOS[currentUser?.rol]?.inicio || "/login";

  return (
    <div className="card" style={{ maxWidth: 540, margin: "40px auto", textAlign: "center", padding: 36 }}>
      <div style={{ color: "#b91c1c", marginBottom: 12 }}>
        <ShieldX size={48} />
      </div>
      <div className="rf-tag">ACCESO · RUTA DENEGADA</div>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>403 Prohibido</h1>
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Su rol (<strong>{currentUser?.rol}</strong>) no tiene permisos para acceder a este módulo. El intento de acceso ha quedado registrado en la auditoría de seguridad.
      </p>
      <Link to={rutaInicio} className="btn btn-primary">
        ← Volver a mi módulo autorizado
      </Link>
    </div>
  );
}