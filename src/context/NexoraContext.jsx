import React, { createContext, useContext, useState } from "react";
import { dbService, ROLES_PERMISOS } from "../services/NexoraDatabase";
import { Usuario, Militar, Insumo, Mision } from "../models/NexoraModels";

const NexoraContext = createContext();
const SESSION_KEY = "nexora_active_user_v1";

export const NexoraProvider = ({ children }) => {
  // Contador para disparar re-render limpio cuando muta la instancia Singleton POO
  const [, setVersion] = useState(0);
  const refresh = () => {
    dbService.persistir();
    setVersion((v) => v + 1);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [sessionMessage, setSessionMessage] = useState(null);

  // RF-007: Inicio de sesión delegando validación a la clase Usuario (POO)
  const login = (username, password) => {
    const userObj = dbService.usuarios.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!userObj) {
      dbService.registrarAcceso(username || "desconocido", "Usuario no registrado", "Fallido");
      refresh();
      return { ok: false, error: "Credenciales inválidas. Verifique su usuario y contraseña." };
    }

    const validacion = userObj.validarPassword(password);
    if (!validacion.ok) {
      dbService.registrarAcceso(
        userObj.username,
        validacion.bloqueado ? "Bloqueo de cuenta · 3 intentos fallidos" : validacion.motivo,
        "Fallido"
      );
      refresh();
      return { ok: false, error: validacion.motivo };
    }

    userObj.ultimoAcceso = dbService.obtenerMarcaTemporal().slice(0, 11).replace(" ", " · ");
    const sesionPlana = {
      idUsuario: userObj.idUsuario,
      username: userObj.username,
      nombreCompleto: userObj.nombreCompleto,
      iniciales: userObj.iniciales,
      email: userObj.email,
      rol: userObj.rol,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesionPlana));
    setCurrentUser(sesionPlana);
    setSessionMessage(null);
    dbService.registrarAcceso(userObj.username, `Inicio de sesión · ${userObj.rol}`, "Exitoso");
    refresh();

    return { ok: true, rutaInicio: ROLES_PERMISOS[userObj.rol]?.inicio || "/tablero" };
  };

  const logout = (porInactividad = false) => {
    if (currentUser) {
      dbService.registrarAcceso(
        currentUser.username,
        porInactividad ? "Cierre por inactividad" : "Cierre de sesión",
        "Exitoso"
      );
    }
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    if (porInactividad) {
      setSessionMessage("Sesión cerrada por inactividad. Sus acciones confirmadas conservan trazabilidad.");
    }
    refresh();
  };

  const tieneAccesoRuta = (ruta) => {
    if (!currentUser) return false;
    const cfg = ROLES_PERMISOS[currentUser.rol];
    if (!cfg) return false;
    if (ruta.startsWith("/misiones/")) return cfg.rutas.includes("/misiones");
    return cfg.rutas.includes(ruta);
  };

  // RF-001: Personal
  const registrarMilitar = (datos) => {
    if (!datos.nombres || !datos.apellidos || !datos.especialidad) {
      return { ok: false, error: "Todos los campos obligatorios deben completarse." };
    }
    const nuevo = new Militar({
      id: `PER-${String(Date.now()).slice(-3)}`,
      ...datos,
      estado: "Disponible",
    });
    dbService.personal.unshift(nuevo);
    dbService.registrarAuditoria(
      currentUser?.username,
      `Registrar militar ${nuevo.nombreCompleto}`,
      "Personal",
      `Nuevo ingreso → ${nuevo.escuadron}`,
      {},
      { militar: nuevo.nombreCompleto, escuadron: nuevo.escuadron }
    );
    refresh();
    return { ok: true };
  };

  const asignarMilitarAMision = (militarId, codigoMision, rolEnMision) => {
    try {
      const militar = dbService.personal.find((p) => p.id === militarId);
      const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
      if (!militar || !mision) throw new Error("Seleccione un militar y una misión válidos.");

      militar.asignarAMision(codigoMision);
      mision.personalAsignado.push(`${militar.nombreCompleto} - ${rolEnMision}`);
      mision.bitacora.unshift({
        hora: dbService.obtenerMarcaTemporal().split(" ")[1],
        novedad: `Personal asignado: ${militar.nombreCompleto} (${rolEnMision})`,
        operador: currentUser?.nombreCompleto || "Oficial de Personal",
      });

      dbService.registrarAuditoria(
        currentUser?.username,
        `Asignar personal a ${codigoMision}`,
        "Personal",
        `Disponible → Asignado (${militar.apellidos})`,
        { estado: "Disponible" },
        { estado: "Asignado", mision: codigoMision }
      );
      refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const cambiarEstadoMilitar = (militarId, nuevoEstado) => {
    const militar = dbService.personal.find((p) => p.id === militarId);
    if (!militar) return;
    const anterior = militar.estado;
    militar.estado = nuevoEstado;
    if (nuevoEstado === "Disponible") militar.misionAsignada = null;

    dbService.registrarAuditoria(
      currentUser?.username,
      `Cambiar estado de ${militar.nombreCompleto}`,
      "Personal",
      `${anterior} → ${nuevoEstado}`,
      { estado: anterior },
      { estado: nuevoEstado }
    );
    refresh();
  };

  // RF-002: Insumos
  const procesarDespacho = (insumoId, cantidad, codigoMision) => {
    try {
      const insumo = dbService.insumos.find((i) => i.id === insumoId);
      const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
      if (!insumo || !mision) throw new Error("Insumo o misión no válidos.");

      const stockAnterior = insumo.stockActual;
      const quedoCritico = insumo.despachar(cantidad);
      const idSol = `DSP-${String(Date.now()).slice(-3)}`;

      dbService.solicitudesDespacho.unshift({
        id: idSol,
        insumoId: insumo.id,
        insumoNombre: insumo.nombre,
        cantidad: Number(cantidad),
        unidad: insumo.unidad,
        misionCodigo: codigoMision,
        estado: "Procesado",
        hora: dbService.obtenerMarcaTemporal().split(" ")[1].slice(0, 5),
      });

      mision.recursosPendientes.push({
        id: `REC-${Date.now()}`,
        recurso: insumo.nombre,
        entregado: `${cantidad} ${insumo.unidad}`,
        pendiente: Number(cantidad),
        unidad: insumo.unidad,
      });

      mision.bitacora.unshift({
        hora: dbService.obtenerMarcaTemporal().split(" ")[1],
        novedad: `Despacho ${idSol}: ${cantidad} ${insumo.unidad} de ${insumo.nombre}.`,
        operador: currentUser?.nombreCompleto || "Logístico",
      });

      dbService.registrarAuditoria(
        currentUser?.username,
        `Procesar despacho ${idSol}`,
        "Insumos",
        `${stockAnterior} ${insumo.unidad} → ${insumo.stockActual} ${insumo.unidad}`,
        { stock: stockAnterior },
        { stock: insumo.stockActual, mision: codigoMision }
      );
      refresh();
      return { ok: true, alertaCritica: quedoCritico };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const registrarInsumo = (datos) => {
    const nuevo = new Insumo({
      id: `INS-${String(Date.now()).slice(-3)}`,
      ...datos,
    });
    dbService.insumos.push(nuevo);
    dbService.registrarAuditoria(
      currentUser?.username,
      `Registrar insumo ${nuevo.nombre}`,
      "Insumos",
      `0 → ${nuevo.stockActual} ${nuevo.unidad}`,
      {},
      nuevo
    );
    refresh();
  };

  // RF-003 & RF-006: Misiones
  const crearMision = (datos) => {
    const nueva = new Mision({
      codigo: `NXR-0${28 + dbService.misiones.length}`,
      nombre: datos.nombre,
      objetivo: datos.objetivo,
      escuadron: datos.escuadron,
      inicio: dbService.obtenerMarcaTemporal(),
      finPrevisto: "24/10/2026 18:00:00",
      estado: "En Preparación",
      riesgo: datos.riesgo || "Bajo",
      zona: datos.zona || "A-1",
      sector: `Sector ${datos.zona || "A-1"}`,
      coordenadasTexto: `Cuadrante ${datos.zona || "A-1"} · X 048 / Y 062`,
      bitacora: [
        {
          hora: dbService.obtenerMarcaTemporal().split(" ")[1],
          novedad: "Misión creada en planificación.",
          operador: currentUser?.nombreCompleto || "Comandante Operativo",
        },
      ],
    });
    dbService.misiones.unshift(nueva);
    dbService.registrarAuditoria(
      currentUser?.username,
      `Crear misión ${nueva.codigo}`,
      "Misiones",
      "Nueva → En Preparación",
      {},
      { codigo: nueva.codigo, nombre: nueva.nombre }
    );
    refresh();
  };

  const asignarUnidadAMision = (codigoMision, matricula) => {
    try {
      const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
      const aeronave = dbService.flota.find((a) => a.matricula === matricula);
      if (!mision || !aeronave) throw new Error("Seleccione una aeronave válida.");

      const hora = dbService.obtenerMarcaTemporal().split(" ")[1];
      mision.vincularAeronave(aeronave, currentUser?.nombreCompleto || "Comandante Operativo", hora);
      aeronave.misionActual = codigoMision;

      dbService.registrarAuditoria(
        currentUser?.username,
        `Asignar ${matricula} a ${codigoMision}`,
        "Misiones",
        `Sin unidad → ${matricula}`,
        { mision: codigoMision },
        { unidad: matricula }
      );
      refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const registrarNovedadMision = (codigoMision, texto) => {
    const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
    if (!mision || !texto.trim()) return;
    mision.bitacora.unshift({
      hora: dbService.obtenerMarcaTemporal().split(" ")[1],
      novedad: texto,
      operador: currentUser?.nombreCompleto || "Operador",
    });
    dbService.registrarAuditoria(
      currentUser?.username,
      `Novedad en bitácora ${codigoMision}`,
      "Misiones",
      "Registro añadido",
      {},
      { novedad: texto }
    );
    refresh();
  };

  const devolverRecursosMision = (codigoMision) => {
    const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
    if (!mision) return;
    mision.recursosPendientes = mision.recursosPendientes.map((r) => ({ ...r, pendiente: 0 }));
    mision.bitacora.unshift({
      hora: dbService.obtenerMarcaTemporal().split(" ")[1],
      novedad: "Paz y salvo de recursos confirmado en su totalidad.",
      operador: currentUser?.nombreCompleto || "Logístico",
    });
    dbService.registrarAuditoria(
      currentUser?.username,
      `Paz y salvo recursos ${codigoMision}`,
      "Misiones",
      "Pendiente → 0",
      {},
      { mision: codigoMision }
    );
    refresh();
  };

  const cambiarEstadoMision = (codigoMision, nuevoEstado, motivoAborto = "") => {
    try {
      const mision = dbService.misiones.find((m) => m.codigo === codigoMision);
      if (!mision) throw new Error("Misión no encontrada.");
      const estadoAnterior = mision.estado;

      mision.cambiarEstado(
        nuevoEstado,
        motivoAborto,
        currentUser?.nombreCompleto || "Comandante Operativo",
        dbService.obtenerMarcaTemporal()
      );

      dbService.registrarAuditoria(
        currentUser?.username,
        `Cambiar estado ${codigoMision}`,
        "Misiones",
        `${estadoAnterior} → ${nuevoEstado}`,
        { estado: estadoAnterior },
        { estado: nuevoEstado, motivo: motivoAborto || "N/A" }
      );
      refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  // RF-006: Flota
  const registrarFallaFlota = (matricula, descripcion, severidad) => {
    try {
      const aeronave = dbService.flota.find((a) => a.matricula === matricula);
      if (!aeronave) throw new Error("Aeronave no encontrada.");
      const estadoAnterior = aeronave.estado;

      const idOrden = aeronave.registrarFalla({
        descripcion,
        severidad,
        responsable: currentUser?.nombreCompleto || "Jefe de Mantenimiento",
        fechaHora: dbService.obtenerMarcaTemporal(),
      });

      dbService.registrarAuditoria(
        currentUser?.username,
        `Registrar falla en ${matricula}`,
        "Flota",
        `${estadoAnterior} → ${aeronave.estado} (${idOrden})`,
        { estado: estadoAnterior },
        { estado: aeronave.estado, orden: idOrden }
      );
      refresh();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const cerrarOrdenMantenimiento = (matricula, idOrden, trabajoRealizado) => {
    const aeronave = dbService.flota.find((a) => a.matricula === matricula);
    if (!aeronave) return;
    aeronave.cerrarOrden(idOrden, trabajoRealizado, dbService.obtenerMarcaTemporal());

    dbService.registrarAuditoria(
      currentUser?.username,
      `Cerrar orden ${idOrden} (${matricula})`,
      "Flota",
      "En Mantenimiento → Operativo",
      { orden: idOrden },
      { estado: "Operativo" }
    );
    refresh();
  };

  // RF-007: Usuarios
  const crearUsuario = (datos) => {
    const duplicado = dbService.usuarios.some(
      (u) => u.username.toLowerCase() === datos.username.toLowerCase() || u.email.toLowerCase() === datos.email.toLowerCase()
    );
    if (duplicado) return { ok: false, error: "El username o correo institucional ya existe." };

    if (!Usuario.validarPoliticaPassword(datos.password)) {
      return {
        ok: false,
        error: "La contraseña debe tener mínimo 12 caracteres, mayúscula, minúscula, número y símbolo.",
      };
    }

    const nuevo = new Usuario({
      idUsuario: `USR-${String(Date.now()).slice(-3)}`,
      username: datos.username,
      password: datos.password,
      nombreCompleto: datos.username,
      email: datos.email,
      rol: datos.rol,
      activo: true,
    });

    dbService.usuarios.push(nuevo);
    dbService.registrarAuditoria(
      currentUser?.username,
      `Crear usuario ${nuevo.username}`,
      "Usuarios",
      `Nuevo → ${nuevo.rol}`,
      {},
      { username: nuevo.username, rol: nuevo.rol }
    );
    refresh();
    return { ok: true };
  };

  const toggleUsuarioActivo = (idUsuario) => {
    const target = dbService.usuarios.find((u) => u.idUsuario === idUsuario);
    if (!target) return;
    target.activo = !target.activo;
    target.intentosFallidos = 0;
    target.bloqueadoHasta = null;

    dbService.registrarAuditoria(
      currentUser?.username,
      `${target.activo ? "Activar" : "Desactivar"} usuario ${target.username}`,
      "Usuarios",
      `Activo: ${target.activo}`,
      {},
      { activo: target.activo }
    );
    refresh();
  };

  const resetDatabase = () => {
    dbService.restaurarTodo();
    refresh();
  };

  return (
    <NexoraContext.Provider
      value={{
        db: dbService,
        currentUser,
        sessionMessage,
        login,
        logout,
        tieneAccesoRuta,
        registrarMilitar,
        asignarMilitarAMision,
        cambiarEstadoMilitar,
        procesarDespacho,
        registrarInsumo,
        crearMision,
        asignarUnidadAMision,
        registrarNovedadMision,
        devolverRecursosMision,
        cambiarEstadoMision,
        registrarFallaFlota,
        cerrarOrdenMantenimiento,
        crearUsuario,
        toggleUsuarioActivo,
        registrarAuditoria: (accion, modulo, resumen, ant, nuev) => {
          dbService.registrarAuditoria(currentUser?.username, accion, modulo, resumen, ant, nuev);
          refresh();
        },
        resetDatabase,
      }}
    >
      {children}
    </NexoraContext.Provider>
  );
};

export const useNexora = () => useContext(NexoraContext);