// ============================================================================
// CAPA DE DOMINIO (POO) - PLATAFORMA NÉXORA
// ============================================================================

export class Usuario {
  constructor({
    idUsuario,
    username,
    password,
    nombreCompleto,
    iniciales,
    email,
    rol,
    activo = true,
    ultimoAcceso = "Sin ingresos",
    intentosFallidos = 0,
    bloqueadoHasta = null,
  }) {
    this.idUsuario = idUsuario;
    this.username = username;
    this.password = password;
    this.nombreCompleto = nombreCompleto;
    this.iniciales = iniciales || username.slice(0, 2).toUpperCase();
    this.email = email;
    this.rol = rol;
    this.activo = activo;
    this.ultimoAcceso = ultimoAcceso;
    this.intentosFallidos = intentosFallidos;
    this.bloqueadoHasta = bloqueadoHasta;
  }

  estaBloqueado() {
    if (!this.bloqueadoHasta) return false;
    return new Date(this.bloqueadoHasta) > new Date();
  }

  validarPassword(inputPassword) {
    if (!this.activo) {
      return { ok: false, motivo: "Cuenta institucional desactivada." };
    }
    if (this.estaBloqueado()) {
      return {
        ok: false,
        bloqueado: true,
        motivo: "Credenciales inválidas. Acceso bloqueado por 15 minutos tras 3 intentos fallidos.",
      };
    }
    if (this.password !== inputPassword) {
      this.intentosFallidos += 1;
      if (this.intentosFallidos >= 3) {
        this.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        return {
          ok: false,
          bloqueado: true,
          motivo: "Credenciales inválidas. Acceso bloqueado: se registraron 3 intentos fallidos (15 min).",
        };
      }
      return {
        ok: false,
        motivo: `Credenciales inválidas. Intento ${this.intentosFallidos} de 3.`,
      };
    }

    // Éxito: reinicia contadores
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;
    return { ok: true };
  }

  static validarPoliticaPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    return regex.test(password);
  }
}

export class Militar {
  constructor({ id, nombres, apellidos, rango, especialidad, escuadron, estado = "Disponible", misionAsignada = null }) {
    this.id = id;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.rango = rango;
    this.especialidad = especialidad;
    this.escuadron = escuadron;
    this.estado = estado;
    this.misionAsignada = misionAsignada;
  }

  get nombreCompleto() {
    return `${this.rango} ${this.nombres} ${this.apellidos}`;
  }

  puedeAsignarse() {
    return this.estado === "Disponible";
  }

  asignarAMision(codigoMision) {
    if (!this.puedeAsignarse()) {
      throw new Error("El militar no está disponible. Solo el personal Disponible puede asignarse a una misión.");
    }
    this.estado = "Asignado";
    this.misionAsignada = codigoMision;
  }
}

export class Insumo {
  constructor({ id, nombre, categoria, stockActual, stockMinimo, capacidadMax, unidad, despachadoPeriodo = 0 }) {
    this.id = id;
    this.nombre = nombre;
    this.categoria = categoria;
    this.stockActual = Number(stockActual);
    this.stockMinimo = Number(stockMinimo);
    this.capacidadMax = Number(capacidadMax || stockActual * 2);
    this.unidad = unidad;
    this.despachadoPeriodo = Number(despachadoPeriodo);
  }

  get esCritico() {
    return this.stockActual <= this.stockMinimo;
  }

  get porcentajeNivel() {
    if (!this.capacidadMax) return 0;
    return Math.min(100, Math.round((this.stockActual / this.capacidadMax) * 100));
  }

  despachar(cantidad) {
    const cant = Number(cantidad);
    if (isNaN(cant) || cant <= 0) {
      throw new Error("La cantidad a despachar debe ser mayor a cero.");
    }
    if (cant > this.stockActual) {
      throw new Error(
        `Saldo insuficiente. No se puede despachar ${cant.toLocaleString()} ${this.unidad} de ${this.nombre}. Disponible: ${this.stockActual.toLocaleString()} ${this.unidad}.`
      );
    }
    this.stockActual -= cant;
    this.despachadoPeriodo += cant;
    return this.esCritico;
  }
}

export class Aeronave {
  constructor({
    matricula,
    tipo,
    horasVuelo,
    estado = "Operativo",
    cuadrante = "A-3",
    misionActual = null,
    sinSenalSegundos = 0,
    coords = { x: 24, y: 78 },
    fallas = [],
    ordenes = [],
    historial = [],
  }) {
    this.matricula = matricula;
    this.tipo = tipo;
    this.horasVuelo = Number(horasVuelo);
    this.estado = estado;
    this.cuadrante = cuadrante;
    this.misionActual = misionActual;
    this.sinSenalSegundos = sinSenalSegundos;
    this.coords = coords;
    this.fallas = fallas;
    this.ordenes = ordenes;
    this.historial = historial;
  }

  estaOperativa() {
    return this.estado === "Operativo";
  }

  registrarFalla({ descripcion, severidad, responsable, fechaHora }) {
    if (!descripcion || !descripcion.trim()) {
      throw new Error("Debe describir la falla observada.");
    }
    const idOrden = `OM-${String(Date.now()).slice(-3)}`;
    this.estado = severidad === "Crítica" ? "Fuera de Servicio" : "En Mantenimiento";

    this.fallas.unshift({
      id: `FAL-${String(Date.now()).slice(-3)}`,
      fecha: fechaHora,
      descripcion,
      severidad,
      estado: "En revisión",
    });

    this.ordenes.unshift({
      idOrden,
      tipo: severidad === "Preventiva" ? "Preventiva" : "Correctiva",
      apertura: fechaHora,
      responsable,
      descripcion,
      estado: "En ejecución",
    });

    this.historial.unshift({
      fecha: fechaHora,
      detalle: `Falla reportada (${severidad}). Orden ${idOrden} generada. Unidad bloqueada.`,
    });

    return idOrden;
  }

  cerrarOrden(idOrden, trabajoRealizado, fechaHora) {
    this.ordenes = this.ordenes.map((o) => (o.idOrden === idOrden ? { ...o, estado: "Cerrada" } : o));
    this.fallas = this.fallas.map((f) => ({ ...f, estado: "Resuelta" }));
    this.estado = "Operativo";
    this.historial.unshift({
      fecha: fechaHora,
      detalle: `Orden ${idOrden} cerrada (${trabajoRealizado || "Inspección aprobada"}). Unidad vuelve a Operativo.`,
    });
  }
}

export class Mision {
  constructor({
    codigo,
    nombre,
    objetivo,
    escuadron,
    inicio,
    finPrevisto,
    finReal = null,
    estado = "En Preparación",
    riesgo = "Bajo",
    zona = "A-1",
    sector = "Sector Alfa",
    coordenadasTexto = "",
    unidadesAsignadas = [],
    personalAsignado = [],
    recursosPendientes = [],
    bitacora = [],
  }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.objetivo = objetivo;
    this.escuadron = escuadron;
    this.inicio = inicio;
    this.finPrevisto = finPrevisto;
    this.finReal = finReal;
    this.estado = estado;
    this.riesgo = riesgo;
    this.zona = zona;
    this.sector = sector;
    this.coordenadasTexto = coordenadasTexto;
    this.unidadesAsignadas = unidadesAsignadas;
    this.personalAsignado = personalAsignado;
    this.recursosPendientes = recursosPendientes;
    this.bitacora = bitacora;
  }

  get tieneRecursosPendientes() {
    return this.recursosPendientes.some((r) => Number(r.pendiente) > 0);
  }

  vincularAeronave(aeronave, operador, hora) {
    if (!aeronave.estaOperativa()) {
      throw new Error(
        `La aeronave ${aeronave.matricula} se encuentra en estado "${aeronave.estado}". La asignación está bloqueada sin excepción.`
      );
    }
    if (!this.unidadesAsignadas.includes(aeronave.matricula)) {
      this.unidadesAsignadas.push(aeronave.matricula);
    }
    this.bitacora.unshift({
      hora,
      novedad: `${aeronave.matricula} asignada; unidad Operativo.`,
      operador,
    });
  }

  cambiarEstado(nuevoEstado, motivoAborto, operador, fechaHora) {
    if (nuevoEstado === "Completada" && this.tieneRecursosPendientes) {
      throw new Error(
        "No se puede completar: hay recursos pendientes por devolver. Cierre bloqueado hasta confirmar el paz y salvo completo."
      );
    }
    if (nuevoEstado === "Abortada" && (!motivoAborto || !motivoAborto.trim())) {
      throw new Error("El motivo de aborto es obligatorio para cancelar la misión.");
    }

    this.estado = nuevoEstado;
    if (nuevoEstado === "Completada" || nuevoEstado === "Abortada") {
      this.finReal = fechaHora;
    }

    this.bitacora.unshift({
      hora: fechaHora.split(" ")[1] || fechaHora,
      novedad:
        nuevoEstado === "Abortada"
          ? `Misión Abortada. Motivo: ${motivoAborto}`
          : `Estado actualizado a ${nuevoEstado}.`,
      operador,
    });
  }
}