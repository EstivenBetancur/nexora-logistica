import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutGrid, Users, Package, Compass, Plane, BarChart3, FileSearch, UserCog, ShieldCheck } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import { ROLES_PERMISOS } from "../services/NexoraDatabase";

const MENU_ITEMS = [
  { to: "/tablero", label: "Tablero", icon: LayoutGrid },
  { to: "/personal", label: "Personal", icon: Users },
  { to: "/insumos", label: "Insumos", icon: Package },
  { to: "/misiones", label: "Misiones", icon: Compass },
  { to: "/flota", label: "Flota", icon: Plane },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/auditoria", label: "Auditoría", icon: FileSearch },
  { to: "/usuarios", label: "Usuarios", icon: UserCog },
];

export default function Sidebar() {
  const { currentUser } = useNexora();
  const location = useLocation();

  if (!currentUser) return null;
  const rolInfo = ROLES_PERMISOS[currentUser.rol] || { rutas: [], descripcionAcceso: "" };
  const itemsPermitidos = MENU_ITEMS.filter((item) => rolInfo.rutas.includes(item.to));

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <div className="brand-icon"><Shield size={20} /></div>
          <div>
            <div className="brand-title">NÉXORA</div>
            <div className="brand-sub">Comando Logístico</div>
          </div>
        </div>

        <div className="sidebar-section-label">Espacio de trabajo</div>
        <nav className="sidebar-nav">
          {itemsPermitidos.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link key={item.to} to={item.to} className={`nav-link ${isActive ? "active" : ""}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-role-box">
          <h4><ShieldCheck size={15} color="#60a5fa" /> Acceso por perfil</h4>
          <p>{rolInfo.descripcionAcceso}</p>
        </div>
      </div>

      <div className="sidebar-footer-info">
        <strong>• ENTORNO DEMOSTRATIVO</strong>
        <p style={{ marginTop: 4 }}>Base Aérea Medellín · NXR / V.2.4.0</p>
      </div>
    </aside>
  );
}