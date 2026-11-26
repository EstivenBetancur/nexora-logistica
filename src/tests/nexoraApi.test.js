import { describe, it, expect, beforeEach } from "vitest";

// 1. Mock de localStorage para entorno Node.js (Vitest)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

globalThis.localStorage = localStorageMock;

// 2. Importamos el servicio API y los modelos después de definir localStorage
const { dbService, ROLES_PERMISOS } = await import("../services/NexoraDatabase.js");
const { Usuario, Militar, Insumo, Aeronave, Mision } = await import("../models/NexoraModels.js");

describe("Suite de Pruebas Automatizadas API NÉXORA (RF-001 a RF-008)", () => {
  beforeEach(() => {
    localStorage.clear();
    dbService.restaurarTodo();
  });

  // =========================================================================
  // RF-007: AUTENTICACIÓN, BLOQUEO Y RBAC
  // =========================================================================
  describe("RF-007 · Autenticación, Seguridad y Control de Acceso (RBAC)", () => {
    it("CP-001: Debe validar credenciales correctas y permitir acceso", () => {
      const user = dbService.usuarios.find((u) => u.username === "cmendoza");
      const res = user.validarPassword("Password123!");
      expect(res.ok).toBe(true);
      expect(user.intentosFallidos).toBe(0);
    });

    it("CP-002: Debe bloquear la cuenta por 15 minutos tras 3 intentos fallidos", () => {
      const user = dbService.usuarios.find((u) => u.username === "jrestrepo");
      user.validarPassword("ClaveErronea1");
      user.validarPassword("ClaveErronea2");
      const tercerIntento = user.validarPassword("ClaveErronea3");

      expect(tercerIntento.ok).toBe(false);
      expect(tercerIntento.bloqueado).toBe(true);
      expect(user.estaBloqueado()).toBe(true);
    });

    it("CP-003: Debe exigir política de contraseña robusta (mín. 12 caracteres, mayús, minús, número y símbolo)", () => {
      expect(Usuario.validarPoliticaPassword("123456")).toBe(false);
      expect(Usuario.validarPoliticaPassword("password123!")).toBe(false); // sin mayúscula
      expect(Usuario.validarPoliticaPassword("PasswordSegura2026!")).toBe(true);
    });

    it("CP-004: Debe restringir acceso a Auditoría para roles distintos a Auditor de Seguridad", () => {
      expect(ROLES_PERMISOS["Logístico"].rutas.includes("/auditoria")).toBe(false);
      expect(ROLES_PERMISOS["Administrador del Sistema"].rutas.includes("/auditoria")).toBe(false);
      expect(ROLES_PERMISOS["Auditor de Seguridad"].rutas.includes("/auditoria")).toBe(true);
    });
  });

  // =========================================================================
  // RF-001: GESTIÓN DE PERSONAL Y ESCUADRONES
  // =========================================================================
  describe("RF-001 · Gestión de Personal Militar", () => {
    it("CP-005: Debe impedir asignar un militar en estado 'No disponible' a una misión", () => {
      const militarNoDisp = dbService.personal.find((p) => p.estado === "No disponible");
      expect(() => militarNoDisp.asignarAMision("NXR-027")).toThrow(/no está disponible/i);
    });

    it("CP-006: Debe asignar correctamente un militar 'Disponible' y cambiar su estado a 'Asignado'", () => {
      const militarDisp = dbService.personal.find((p) => p.estado === "Disponible");
      militarDisp.asignarAMision("NXR-027");
      expect(militarDisp.estado).toBe("Asignado");
      expect(militarDisp.misionAsignada).toBe("NXR-027");
    });
  });

  // =========================================================================
  // RF-002: INVENTARIO DE INSUMOS CRÍTICOS Y DESPACHOS
  // =========================================================================
  describe("RF-002 · Insumos Críticos y Despachos", () => {
    it("CP-007: Debe impedir despachos mayores al stock disponible (evita saldos negativos)", () => {
      const jetA1 = dbService.insumos.find((i) => i.nombre === "Jet A-1");
      expect(() => jetA1.despachar(5000)).toThrow(/Saldo insuficiente/i);
      expect(jetA1.stockActual).toBe(2400);
    });

    it("CP-008: Debe descontar stock y activar alerta crítica cuando baja del umbral mínimo", () => {
      // Seleccionamos dinámicamente un insumo que actualmente NO esté en nivel crítico
      const insumoNormal = dbService.insumos.find((i) => !i.esCritico);
      expect(insumoNormal).toBeDefined();
      expect(insumoNormal.esCritico).toBe(false);

      // Despachamos lo necesario para dejarlo por debajo de su stockMinimo
      const cantidadADespachar = insumoNormal.stockActual - insumoNormal.stockMinimo + 10;
      const quedoCritico = insumoNormal.despachar(cantidadADespachar);

      expect(quedoCritico).toBe(true);
      expect(insumoNormal.esCritico).toBe(true);
    });
  });

  // =========================================================================
  // RF-006: FLOTA Y MANTENIMIENTO PREVENTIVO / CORRECTIVO
  // =========================================================================
  describe("RF-006 · Control Técnico de Flota", () => {
    it("CP-009: Debe bloquear asignación de aeronave 'En Mantenimiento' a cualquier misión", () => {
      const mision = dbService.misiones.find((m) => m.codigo === "NXR-026");
      const avionMantenimiento = dbService.flota.find((a) => a.estado === "En Mantenimiento");

      expect(() => mision.vincularAeronave(avionMantenimiento, "Mayor Peña", "14:30:00")).toThrow(
        /bloqueada/i
      );
    });

    it("CP-010: Debe cambiar aeronave a 'Fuera de Servicio' al registrar falla crítica y restaurar al cerrar orden", () => {
      const avion = dbService.flota.find((a) => a.matricula === "FAC-3102");
      expect(avion.estado).toBe("Operativo");

      const idOrden = avion.registrarFalla({
        descripcion: "Falla en sensor hidráulico principal",
        severidad: "Crítica",
        responsable: "Tte. Oscar Morales",
        fechaHora: "26/11/2026 11:00:00",
      });

      expect(avion.estado).toBe("Fuera de Servicio");
      expect(avion.estaOperativa()).toBe(false);

      avion.cerrarOrden(idOrden, "Reemplazo de válvula y pruebas", "26/11/2026 13:00:00");
      expect(avion.estado).toBe("Operativo");
    });
  });

  // =========================================================================
  // RF-003 & RF-004: CICLO DE VIDA DE MISIONES Y VISIBILIDAD TÁCTICA
  // =========================================================================
  describe("RF-003 y RF-004 · Ciclo de Vida de Misiones y Paz y Salvo", () => {
    it("CP-011: Debe bloquear el cierre ('Completada') de una misión con recursos pendientes por devolver", () => {
      const mision = dbService.misiones.find((m) => m.codigo === "NXR-026");
      expect(mision.tieneRecursosPendientes).toBe(true);

      expect(() =>
        mision.cambiarEstado("Completada", "", "Mayor Peña", "26/11/2026 15:00:00")
      ).toThrow(/pendientes/i);
    });

    it("CP-012: Debe permitir cerrar misión una vez cumplido el paz y salvo de recursos", () => {
      const mision = dbService.misiones.find((m) => m.codigo === "NXR-026");
      mision.recursosPendientes = mision.recursosPendientes.map((r) => ({ ...r, pendiente: 0 }));

      mision.cambiarEstado("Completada", "", "Mayor Peña", "26/11/2026 15:30:00");
      expect(mision.estado).toBe("Completada");
      expect(mision.finReal).toBe("26/11/2026 15:30:00");
    });

    it("CP-013: Debe exigir motivo obligatorio al abortar una misión", () => {
      const mision = dbService.misiones.find((m) => m.codigo === "NXR-025");
      expect(() =>
        mision.cambiarEstado("Abortada", "", "Mayor Peña", "26/11/2026 12:00:00")
      ).toThrow(/motivo/i);

      mision.cambiarEstado("Abortada", "Condiciones meteorológicas adversas", "Mayor Peña", "26/11/2026 12:05:00");
      expect(mision.estado).toBe("Abortada");
    });
  });

  // =========================================================================
  // RF-005 & PERSISTENCIA: AUDITORÍA INMUTABLE Y LOCALSTORAGE
  // =========================================================================
  describe("RF-005 · Auditoría Inmutable y Persistencia Local", () => {
    it("CP-014: Debe registrar transacciones en auditoría y persistir cambios en localStorage", () => {
      const totalAntes = dbService.logsTransacciones.length;
      dbService.registrarAuditoria(
        "rgomez",
        "Prueba de despacho automatizado",
        "Insumos",
        "2400 L -> 2000 L",
        { stock: 2400 },
        { stock: 2000 }
      );

      expect(dbService.logsTransacciones.length).toBe(totalAntes + 1);
      expect(dbService.logsTransacciones[0].usuario).toBe("rgomez");

      // Verificar que localStorage guardó el JSON actualizado
      const guardado = JSON.parse(localStorage.getItem("nexora_poo_db_v1"));
      expect(guardado.logsTransacciones.length).toBe(totalAntes + 1);
    });
  });
});