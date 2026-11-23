import React from "react";
import { useNexora } from "../context/NexoraContext";

export default function Footer() {
  const { resetDatabase } = useNexora();
  return (
    <footer className="app-footer">
      <span>NÉXORA · Plataforma Digital para la Administración Logística de Misiones Militares</span>
      <div style={{ display: "flex", gap: 16 }}>
        <span>BASE AÉREA MEDELLÍN 2026</span>
        <button
          type="button"
          onClick={resetDatabase}
          style={{ background: "none", border: "none", color: "#1d5bd6", cursor: "pointer", fontSize: 11, textDecoration: "underline" }}
        >
          Restaurar datos iniciales
        </button>
      </div>
    </footer>
  );
}