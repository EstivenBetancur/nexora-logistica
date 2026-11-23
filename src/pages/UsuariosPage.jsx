import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import { ROLES_PERMISOS } from "../services/NexoraDatabase";
import AlertBanner from "../components/AlertBanner";

export default function UsuariosPage() {
  const { db, crearUsuario, toggleUsuarioActivo } = useNexora();

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Operador");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);

  const usuariosFiltrados = db.usuarios.filter((u) => {
    const matchText =
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "Todos" || u.rol === filtroRol;
    return matchText && matchRol;
  });

  const handleCrear = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg({ type: "red", text: "Las contraseñas no coinciden." });
      return;
    }
    const res = crearUsuario({ username, email, rol, password });
    if (!res.ok) {
      setMsg({ type: "red", text: res.error });
    } else {
      setMsg({ type: "green", text: `Usuario ${username} creado y activado.` });
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="rf-tag">RF-007 / ADMINISTRACIÓN</div>
          <h1 className="page-title">Usuarios, roles y permisos</h1>
          <p className="page-subtitle">
            Administración exclusiva de identidades. Los registros de auditoría no están disponibles para este perfil.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Directorio de usuarios</h3>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <input
            placeholder="Buscar usuario o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="Todos">Todos los roles</option>
            {Object.keys(ROLES_PERMISOS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Último acceso</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.idUsuario}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>
                    <span className={`badge ${u.activo ? "badge-green" : "badge-red"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>{u.ultimoAcceso}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => toggleUsuarioActivo(u.idUsuario)}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 6 }}>Matriz de roles y permisos</h3>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
          C = Consulta · G = Gestión · A = Asignación · E = Generar/exportar · — = Sin acceso.
        </p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rol / NEC</th>
                <th>Tablero</th>
                <th>Personal</th>
                <th>Insumos</th>
                <th>Misiones</th>
                <th>Flota</th>
                <th>Reportes</th>
                <th>Auditoría</th>
                <th>Usuarios</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ROLES_PERMISOS).map(([rolNombre, cfg]) => (
                <tr key={rolNombre}>
                  <td>
                    <strong>{rolNombre}</strong>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{cfg.nec}</div>
                  </td>
                  <td style={{ color: "#1d5bd6", fontWeight: 600 }}>{cfg.permisos.tablero}</td>
                  <td>{cfg.permisos.personal}</td>
                  <td>{cfg.permisos.insumos}</td>
                  <td>{cfg.permisos.misiones}</td>
                  <td>{cfg.permisos.flota}</td>
                  <td>{cfg.permisos.reportes}</td>
                  <td>{cfg.permisos.auditoria}</td>
                  <td>{cfg.permisos.usuarios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Crear usuario institucional</h3>
        {msg && <AlertBanner type={msg.type}>{msg.text}</AlertBanner>}
        <form onSubmit={handleCrear}>
          <div className="grid-3" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Username *</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nuevo.usuario" required />
            </div>
            <div className="form-group">
              <label>Email institucional *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@nexora.demo" required />
            </div>
            <div className="form-group">
              <label>Rol *</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                {Object.keys(ROLES_PERMISOS).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Contraseña temporal * (Mín. 12 caracteres, mayúscula, minúscula, número y símbolo)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <UserPlus size={16} /> Guardar usuario
          </button>
        </form>
      </div>
    </div>
  );
}