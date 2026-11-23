import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useNexora } from "../context/NexoraContext";
import AlertBanner from "../components/AlertBanner";

export default function LoginPage() {
  const { db, login, sessionMessage } = useNexora();
  const [username, setUsername] = useState("cmendoza");
  const [password, setPassword] = useState("Password123!");
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.ok) {
      navigate(res.rutaInicio);
    } else {
      setErrorMsg(res.error);
    }
  };

  const seleccionarPerfil = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setErrorMsg(null);
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div className="brand-icon"><Shield size={22} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>NÉXORA</div>
              <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "0.08em" }}>
                COMANDO LOGÍSTICO
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
            SISTEMA INTEGRADO / LOGÍSTICA DE MISIONES
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Cada recurso.
            <br />
            Cada misión.
            <br />
            Una visión común.
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 440 }}>
            Coordinación centralizada de personal militar, insumos críticos y aeronaves en un entorno institucional de acceso controlado.
          </p>
        </div>

        <div style={{ fontSize: 12, color: "#64748b" }}>
          BASE AÉREA DE MEDELLÍN · PROYECTO PEDAGÓGICO INTEGRADOR 2026
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="rf-tag">RF-007 / ACCESO INSTITUCIONAL</span>
            <Lock size={16} color="#1d5bd6" />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Bienvenido a NÉXORA</h2>
          <p style={{ color: "#64748b", marginBottom: 22 }}>
            Ingrese sus credenciales institucionales para acceder a su espacio de trabajo.
          </p>

          {sessionMessage && <AlertBanner type="blue">{sessionMessage}</AlertBanner>}
          {errorMsg && <AlertBanner type="red">{errorMsg}</AlertBanner>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. cmendoza"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "11px", marginTop: 6 }}>
              <span>Iniciar sesión</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="alert-box alert-blue" style={{ marginTop: 18 }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Acceso protegido</strong>
              <div style={{ fontSize: 12 }}>
                Tres intentos fallidos bloquean la cuenta durante 15 minutos. El desbloqueo es automático.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
              PERFILES DE REFERENCIA (CLIC PARA AUTOCOMPLETAR):
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {db.usuarios.map((u) => (
                <button
                  key={u.idUsuario}
                  type="button"
                  onClick={() => seleccionarPerfil(u)}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  {u.rol} ({u.username})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}