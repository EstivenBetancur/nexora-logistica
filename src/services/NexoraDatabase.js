import { Usuario, Militar, Insumo, Aeronave, Mision } from "../models/NexoraModels";

export const ROLES_PERMISOS = {
  "Comandante General": {
    nec: "NEC-004",
    rutas: ["/tablero", "/personal", "/insumos", "/misiones", "/flota", "/reportes"],
    inicio: "/tablero",
    permisos: { tablero: "Completo (Alto Riesgo)", personal: "C", insumos: "C", misiones: "C", flota: "C", reportes: "C", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Vista completa y alto riesgo. Personal, Insumos, Misiones, Flota y Reportes: solo consulta.",
  },
  "Comandante Operativo": {
    nec: "NEC-003",
    rutas: ["/tablero", "/personal", "/insumos", "/misiones", "/flota"],
    inicio: "/tablero",
    permisos: { tablero: "Completo (Alto Riesgo)", personal: "C", insumos: "C", misiones: "C · G · A", flota: "C", reportes: "—", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Tablero completo. Gestiona Misiones y asigna unidades. Personal, Insumos y Flota: consulta.",
  },
  "Logístico": {
    nec: "NEC-002 / 008",
    rutas: ["/tablero", "/insumos", "/misiones", "/reportes"],
    inicio: "/insumos",
    permisos: { tablero: "Insumos", personal: "—", insumos: "C · G", misiones: "C", flota: "—", reportes: "C · E", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Tablero parcial de insumos. Gestiona inventario y despachos; exporta Reportes. Misiones: consulta.",
  },
  "Oficial de Personal": {
    nec: "NEC-001",
    rutas: ["/tablero", "/personal", "/misiones"],
    inicio: "/personal",
    permisos: { tablero: "Personal", personal: "C · G · A", insumos: "—", misiones: "C", flota: "—", reportes: "—", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Tablero parcial de personal. Gestiona Personal y asignaciones. Misiones: consulta.",
  },
  "Jefe de Mantenimiento": {
    nec: "NEC-006",
    rutas: ["/tablero", "/flota"],
    inicio: "/flota",
    permisos: { tablero: "Flota", personal: "—", insumos: "—", misiones: "—", flota: "C · G", reportes: "—", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Tablero parcial de flota. Gestiona Flota, intervenciones y mantenimiento.",
  },
  "Auditor de Seguridad": {
    nec: "NEC-005",
    rutas: ["/auditoria"],
    inicio: "/auditoria",
    permisos: { tablero: "Sin acceso", personal: "—", insumos: "—", misiones: "—", flota: "—", reportes: "—", auditoria: "C", usuarios: "—" },
    descripcionAcceso: "Exclusivamente Auditoría. Registros de solo lectura, sin edición ni eliminación.",
  },
  "Operador": {
    nec: "NEC-007",
    rutas: ["/tablero", "/misiones"],
    inicio: "/tablero",
    permisos: { tablero: "Parcial", personal: "—", insumos: "—", misiones: "C · G", flota: "—", reportes: "—", auditoria: "—", usuarios: "—" },
    descripcionAcceso: "Tablero parcial y registro de bitácora en misiones asignadas.",
  },
  "Administrador del Sistema": {
    nec: "Sin persona",
    rutas: ["/usuarios"],
    inicio: "/usuarios",
    permisos: { tablero: "Sin acceso", personal: "—", insumos: "—", misiones: "—", flota: "—", reportes: "—", auditoria: "—", usuarios: "C · G" },
    descripcionAcceso: "Solo usuarios, roles y permisos. Sin acceso a logs ni capacidad de alterarlos.",
  },
};

const STORAGE_KEY = "nexora_poo_db_v1";

class NexoraDatabaseService {
  constructor() {
    this.cargarDatos();
  }

  getSeedData() {
    return {
      usuarios: [
        { idUsuario: "USR-01", username: "cmendoza", password: "Password123!", nombreCompleto: "Gral. Carlos Mendoza", iniciales: "CM", email: "c.mendoza@nexora.demo", rol: "Comandante General", activo: true, ultimoAcceso: "23/10 · 14:20" },
        { idUsuario: "USR-02", username: "rpena", password: "Password123!", nombreCompleto: "Mayor Ricardo Peña", iniciales: "RP", email: "r.pena@nexora.demo", rol: "Comandante Operativo", activo: true, ultimoAcceso: "23/10 · 14:28" },
        { idUsuario: "USR-03", username: "rgomez", password: "Password123!", nombreCompleto: "Col. Roberto Gómez", iniciales: "RG", email: "r.gomez@nexora.demo", rol: "Logístico", activo: true, ultimoAcceso: "23/10 · 14:15" },
        { idUsuario: "USR-04", username: "srestrepo", password: "Password123!", nombreCompleto: "Mayor Sofía Restrepo", iniciales: "SR", email: "s.restrepo@nexora.demo", rol: "Oficial de Personal", activo: true, ultimoAcceso: "23/10 · 14:05" },
        { idUsuario: "USR-05", username: "omorales", password: "Password123!", nombreCompleto: "Tte. Oscar Morales", iniciales: "OM", email: "o.morales@nexora.demo", rol: "Jefe de Mantenimiento", activo: true, ultimoAcceso: "23/10 · 13:52" },
        { idUsuario: "USR-06", username: "ftorres", password: "Password123!", nombreCompleto: "Lic. Fernando Torres", iniciales: "FT", email: "f.torres@nexora.demo", rol: "Auditor de Seguridad", activo: true, ultimoAcceso: "23/10 · 14:10" },
        { idUsuario: "USR-07", username: "jrestrepo", password: "Password123!", nombreCompleto: "Cap. Juliana Restrepo", iniciales: "JR", email: "j.restrepo@nexora.demo", rol: "Operador", activo: true, ultimoAcceso: "23/10 · 13:45" },
        { idUsuario: "USR-08", username: "admin.sistema", password: "Password123!", nombreCompleto: "Administrador del Sistema", iniciales: "AS", email: "admin@nexora.demo", rol: "Administrador del Sistema", activo: true, ultimoAcceso: "23/10 · 14:00" },
      ],
      escuadrones: [
        { id: "ESC-01", nombre: "Horizonte", tipo: "Aéreo", total: 18, disponibles: 12 },
        { id: "ESC-02", nombre: "Aurora", tipo: "Apoyo y sanidad", total: 16, disponibles: 11 },
        { id: "ESC-03", nombre: "Centinela", tipo: "Logístico", total: 14, disponibles: 9 },
      ],
      personal: [
        { id: "PER-01", nombres: "Laura", apellidos: "Cárdenas", rango: "Capitán", especialidad: "Piloto", escuadron: "Horizonte", estado: "Disponible", misionAsignada: null },
        { id: "PER-02", nombres: "Andrés", apellidos: "Vargas", rango: "Teniente", especialidad: "Copiloto", escuadron: "Horizonte", estado: "Asignado", misionAsignada: "NXR-026" },
        { id: "PER-03", nombres: "Daniela", apellidos: "Ríos", rango: "Sargento", especialidad: "Sanidad", escuadron: "Aurora", estado: "Disponible", misionAsignada: null },
        { id: "PER-04", nombres: "Miguel", apellidos: "Salazar", rango: "Cabo", especialidad: "Comunicaciones", escuadron: "Aurora", estado: "Disponible", misionAsignada: null },
        { id: "PER-05", nombres: "Paula", apellidos: "Mejía", rango: "Teniente", especialidad: "Logística", escuadron: "Centinela", estado: "No disponible", misionAsignada: null },
        { id: "PER-06", nombres: "Jorge", apellidos: "Duarte", rango: "Sargento", especialidad: "Mecánica", escuadron: "Centinela", estado: "Asignado", misionAsignada: "NXR-025" },
      ],
      insumos: [
        { id: "INS-01", nombre: "Jet A-1", categoria: "Combustible", stockActual: 2400, stockMinimo: 3000, capacidadMax: 10000, unidad: "L", despachadoPeriodo: 6000 },
        { id: "INS-02", nombre: "Diésel logístico", categoria: "Combustible", stockActual: 6800, stockMinimo: 2000, capacidadMax: 8000, unidad: "L", despachadoPeriodo: 3600 },
        { id: "INS-03", nombre: "Gasolina de apoyo", categoria: "Combustible", stockActual: 3200, stockMinimo: 1500, capacidadMax: 5000, unidad: "L", despachadoPeriodo: 1600 },
        { id: "INS-04", nombre: "Munición de entrenamiento", categoria: "Armamento", stockActual: 800, stockMinimo: 1000, capacidadMax: 3000, unidad: "un.", despachadoPeriodo: 300 },
        { id: "INS-05", nombre: "Equipo de protección", categoria: "Armamento", stockActual: 240, stockMinimo: 100, capacidadMax: 350, unidad: "un.", despachadoPeriodo: 64 },
      ],
      solicitudesDespacho: [
        { id: "DSP-084", insumoId: "INS-01", insumoNombre: "Jet A-1", cantidad: 600, unidad: "L", misionCodigo: "NXR-027", estado: "Pendiente", hora: "14:31" },
        { id: "DSP-083", insumoId: "INS-05", insumoNombre: "Equipo de protección", cantidad: 12, unidad: "un.", misionCodigo: "NXR-027", estado: "Pendiente", hora: "14:29" },
        { id: "DSP-082", insumoId: "INS-01", insumoNombre: "Jet A-1", cantidad: 800, unidad: "L", misionCodigo: "NXR-026", estado: "Procesado", hora: "14:28" },
      ],
      flota: [
        { matricula: "FAC-1234", tipo: "Helicóptero utilitario", horasVuelo: 86.4, estado: "Operativo", cuadrante: "C-2", misionActual: "NXR-026", sinSenalSegundos: 0, coords: { x: 74, y: 62 }, fallas: [], ordenes: [], historial: [{ fecha: "20/10 · 09:00", detalle: "Inspección pre-vuelo aprobada." }] },
        { matricula: "FAC-2041", tipo: "Helicóptero de apoyo", horasVuelo: 72.8, estado: "Operativo", cuadrante: "C-1", misionActual: "NXR-025", sinSenalSegundos: 42, coords: { x: 76, y: 24 }, fallas: [], ordenes: [], historial: [{ fecha: "21/10 · 11:20", detalle: "Calibración VHF." }] },
        {
          matricula: "FAC-2208",
          tipo: "Helicóptero utilitario",
          horasVuelo: 100.0,
          estado: "En Mantenimiento",
          cuadrante: "A-3",
          misionActual: null,
          sinSenalSegundos: 0,
          coords: { x: 24, y: 78 },
          fallas: [{ id: "FAL-02", fecha: "23/10 · 13:30", descripcion: "Inspección preventiva al alcanzar 100 h.", severidad: "Preventiva", estado: "En revisión" }],
          ordenes: [{ idOrden: "OM-041", tipo: "Preventiva", apertura: "23/10/2026 13:35:20", responsable: "Sgto. Jorge Duarte", descripcion: "Inspección general de 100 horas.", estado: "En ejecución" }],
          historial: [{ fecha: "23/10 · 13:35:20", detalle: "Orden preventiva OM-041 generada tras reintento." }],
        },
        { matricula: "FAC-3102", tipo: "Avión de transporte", horasVuelo: 44.0, estado: "Operativo", cuadrante: "A-3", misionActual: null, sinSenalSegundos: 0, coords: { x: 22, y: 80 }, fallas: [], ordenes: [], historial: [{ fecha: "19/10 · 16:00", detalle: "Disponible en plataforma Base Horizonte." }] },
        {
          matricula: "FAC-4007",
          tipo: "Avión de apoyo",
          horasVuelo: 118.2,
          estado: "Fuera de Servicio",
          cuadrante: "A-3",
          misionActual: null,
          sinSenalSegundos: 0,
          coords: { x: 20, y: 82 },
          fallas: [{ id: "FAL-03", fecha: "22/10 · 08:15", descripcion: "Falla estructural en tren de aterrizaje.", severidad: "Crítica", estado: "Abierta" }],
          ordenes: [{ idOrden: "OM-039", tipo: "Correctiva", apertura: "22/10/2026 08:20:00", responsable: "Tte. Oscar Morales", descripcion: "Reemplazo de actuador hidráulico.", estado: "En ejecución" }],
          historial: [{ fecha: "22/10 · 08:20:00", detalle: "Declarada Fuera de Servicio por falla crítica." }],
        },
      ],
      misiones: [
        {
          codigo: "NXR-026",
          nombre: "Puente Horizonte",
          objetivo: "Traslado de apoyo logístico a estación de simulación Delta. Escuadrón Horizonte.",
          escuadron: "Horizonte",
          inicio: "23/10/2026 13:40:00",
          finPrevisto: "23/10/2026 16:00:00",
          finReal: null,
          estado: "En Vuelo",
          riesgo: "Alto",
          zona: "C-2",
          sector: "Sector Delta",
          coordenadasTexto: "Cuadrante C-2 · X 084 / Y 126",
          unidadesAsignadas: ["FAC-1234"],
          personalAsignado: ["Teniente Andrés Vargas - Copiloto / enlace de misión"],
          recursosPendientes: [
            { id: "REC-01", recurso: "Jet A-1", entregado: "800 L", pendiente: 200, unidad: "L" },
            { id: "REC-02", recurso: "Equipo de protección", entregado: "16 un.", pendiente: 16, unidad: "un." },
          ],
          bitacora: [
            { hora: "14:28:14", novedad: "Confirmada recepción de 800 L Jet A-1.", operador: "Col. Roberto Gómez" },
            { hora: "13:40:00", novedad: "Estado actualizado a En Vuelo.", operador: "Mayor Ricardo Peña" },
          ],
        },
        {
          codigo: "NXR-027",
          nombre: "Enlace Aurora",
          objetivo: "Entrega de material de apoyo sanitario y relevo de comunicaciones.",
          escuadron: "Aurora",
          inicio: "23/10/2026 15:00:00",
          finPrevisto: "23/10/2026 17:30:00",
          finReal: null,
          estado: "En Preparación",
          riesgo: "Medio",
          zona: "B-1",
          sector: "Sector Norte",
          coordenadasTexto: "Cuadrante B-1 · X 052 / Y 041",
          unidadesAsignadas: [],
          personalAsignado: [],
          recursosPendientes: [],
          bitacora: [{ hora: "14:05:00", novedad: "Misión creada en planificación.", operador: "Mayor Ricardo Peña" }],
        },
        {
          codigo: "NXR-025",
          nombre: "Ruta Centinela",
          objetivo: "Retorno de equipo técnico y personal de reconocimiento.",
          escuadron: "Centinela",
          inicio: "23/10/2026 12:15:00",
          finPrevisto: "23/10/2026 15:00:00",
          finReal: null,
          estado: "En Vuelo",
          riesgo: "Bajo",
          zona: "C-1",
          sector: "Sector Oriente",
          coordenadasTexto: "Cuadrante C-1 · X 091 / Y 030",
          unidadesAsignadas: ["FAC-2041"],
          personalAsignado: ["Sargento Jorge Duarte - Mecánica"],
          recursosPendientes: [],
          bitacora: [{ hora: "12:15:00", novedad: "Despegue autorizado hacia cuadrante C-1.", operador: "Mayor Ricardo Peña" }],
        },
        {
          codigo: "NXR-024",
          nombre: "Apoyo Norte",
          objetivo: "Traslado de personal operativo.",
          escuadron: "Aurora",
          inicio: "22/10/2026 08:00:00",
          finPrevisto: "22/10/2026 11:40:00",
          finReal: "22/10/2026 11:40:00",
          estado: "Completada",
          riesgo: "Bajo",
          zona: "A-1",
          sector: "Sector Alfa",
          coordenadasTexto: "Cuadrante A-1 · X 018 / Y 022",
          unidadesAsignadas: ["FAC-3102"],
          personalAsignado: [],
          recursosPendientes: [],
          bitacora: [{ hora: "11:40:00", novedad: "Misión finalizada con paz y salvo total.", operador: "Mayor Ricardo Peña" }],
        },
      ],
      logsAcceso: [
        { id: "ACC-128", fechaHora: "23/10/2026 14:32:00", usuario: "jrestrepo", evento: "Bloqueo de cuenta · 3 intentos fallidos", resultado: "Fallido", ip: "192.0.2.37" },
        { id: "ACC-125", fechaHora: "23/10/2026 14:20:03", usuario: "cmendoza", evento: "Inicio de sesión", resultado: "Exitoso", ip: "192.0.2.24" },
      ],
      logsTransacciones: [
        {
          id: "TRX-046",
          fechaHora: "23/10/2026 14:28:14",
          usuario: "rgomez",
          accion: "Procesar despacho DSP-082",
          modulo: "Insumos",
          ip: "192.0.2.22",
          resumenCambio: "3.200 L → 2.400 L",
          datosAnteriores: { insumo: "Jet A-1", stock: "3.200 L" },
          datosNuevos: { insumo: "Jet A-1", stock: "2.400 L", mision: "NXR-026" },
        },
      ],
    };
  }

  cargarDatos() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : this.getSeedData();

    // Hidratar instancias de clases POO
    this.usuarios = data.usuarios.map((u) => new Usuario(u));
    this.escuadrones = data.escuadrones;
    this.personal = data.personal.map((p) => new Militar(p));
    this.insumos = data.insumos.map((i) => new Insumo(i));
    this.solicitudesDespacho = data.solicitudesDespacho;
    this.flota = data.flota.map((a) => new Aeronave(a));
    this.misiones = data.misiones.map((m) => new Mision(m));
    this.logsAcceso = data.logsAcceso;
    this.logsTransacciones = data.logsTransacciones;
    this.persistir();
  }

  persistir() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        usuarios: this.usuarios,
        escuadrones: this.escuadrones,
        personal: this.personal,
        insumos: this.insumos,
        solicitudesDespacho: this.solicitudesDespacho,
        flota: this.flota,
        misiones: this.misiones,
        logsAcceso: this.logsAcceso,
        logsTransacciones: this.logsTransacciones,
      })
    );
  }

  restaurarTodo() {
    localStorage.removeItem(STORAGE_KEY);
    this.cargarDatos();
  }

  obtenerMarcaTemporal() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  registrarAuditoria(usuario, accion, modulo, resumenCambio, datosAnteriores, datosNuevos) {
    this.logsTransacciones.unshift({
      id: `TRX-${String(Date.now()).slice(-4)}`,
      fechaHora: this.obtenerMarcaTemporal(),
      usuario: usuario || "sistema",
      accion,
      modulo,
      ip: "192.0.2.25",
      resumenCambio,
      datosAnteriores,
      datosNuevos,
    });
    this.persistir();
  }

  registrarAcceso(username, evento, resultado) {
    this.logsAcceso.unshift({
      id: `ACC-${String(Date.now()).slice(-4)}`,
      fechaHora: this.obtenerMarcaTemporal(),
      usuario: username,
      evento,
      resultado,
      ip: "192.0.2.37",
    });
    this.persistir();
  }
}

export const dbService = new NexoraDatabaseService();