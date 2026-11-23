import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import { ROLES_PERMISOS } from "../services/NexoraDatabase";

export default function Topbar() {
  const { currentUser, logout } = useNexora();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;
  const moduloActual = location.pathname.replace("/", "").toUpperCase() || "TABLERO";
  const nec = ROLES_PERMISOS[currentUser.rol]?.nec || "";

  const handleLogout = () => {
    logout(false);
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div>
        <span className="topbar-breadcrumb">CENTRO DE OPERACIONES / {moduloActual}</span>
        <span className="topbar-date">23 de octubre de 2026 · 14:32 COT</span>
      </div>

      <div className="topbar-right">
        <div className="session-status">
          <div><span className="session-dot"></span><strong>Sesión activa</strong></div>
          <div style={{ color: "#64748b", fontSize: 11 }}>Expira 23/10/2026 · 15:02</div>
        </div>

        <div className="user-pill">
          <div className="avatar-circle">{currentUser.iniciales}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{currentUser.nombreCompleto}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{currentUser.rol} · {nec}</div>
          </div>
        </div>

        <button type="button" className="btn-logout" onClick={handleLogout}>
          <LogOut size={15} /><span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}