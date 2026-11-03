// Funciones puras: reciben un valor y devuelven un mensaje de error o null.
const largo = (v, min, max = Infinity) => { const n = String(v).trim().length; return n >= min && n <= max; };

export const validarMarca = (v) => (v ? null : 'Elegí una marca');
export const validarModelo = (v) => (largo(v, 2, 40) ? null : 'Ingresá el modelo del equipo');
export const validarValor = (v) => (Number.isFinite(v) && v >= 100000 && v <= 2500000 ? null : 'El valor debe estar entre $100.000 y $2.500.000');
export const validarAntiguedad = (v) => (v ? null : 'Indicá la antigüedad');
export const validarNombre = (v) => (largo(v, 2) ? null : 'Ingresá tu nombre');
export const validarApellido = (v) => (largo(v, 2) ? null : 'Ingresá tu apellido');
export const validarDni = (v) => (/^\d{7,8}$/.test(v) ? null : 'El DNI debe tener 7 u 8 números');
export const validarEmail = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Ingresá un email válido');
export const validarTerminos = (v) => (v ? null : 'Tenés que aceptar los términos');
export const validarTarjeta = (v) => (/^\d{16}$/.test(v.replace(/\s/g, '')) ? null : 'Número de tarjeta inválido');
export const validarCvv = (v) => (/^\d{3}$/.test(v) ? null : 'CVV inválido');
export const validarTitular = (v) => (largo(v, 1) ? null : 'Ingresá el nombre del titular');

export function validarNacimiento(v) {
  const msg = 'Tenés que ser mayor de edad';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return msg;
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y + 18, m - 1, d) <= new Date() ? null : msg;
}

export function validarCelular(v) {
  const d = v.replace(/[\s-]/g, '');
  return /^\d{10}$/.test(d) && !d.startsWith('0') && !d.startsWith('15') ? null : 'Ej.: 11 5555-1234';
}

export function validarVencimiento(v, hoy = new Date()) {
  const msg = 'Vencimiento inválido';
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return msg;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12) return msg;
  // Vigente hasta el último día del mes indicado.
  return new Date(2000 + Number(m[2]), mes, 1) > hoy ? null : msg;
}

// ruta del estado -> [nombre para el aviso "falta completar", validador]
export const reglas = {
  'equipo.marca': ['Marca', validarMarca],
  'equipo.modelo': ['Modelo', validarModelo],
  'equipo.valor': ['Valor del equipo', validarValor],
  'equipo.antiguedad': ['Antigüedad', validarAntiguedad],
  'titular.nombre': ['Nombre', validarNombre],
  'titular.apellido': ['Apellido', validarApellido],
  'titular.dni': ['DNI', validarDni],
  'titular.nacimiento': ['Fecha de nacimiento', validarNacimiento],
  'titular.email': ['Email', validarEmail],
  'titular.celular': ['Celular', validarCelular],
  'titular.terminos': ['Términos', validarTerminos],
  'pago.tarjeta': ['Tarjeta', validarTarjeta],
  'pago.vencimiento': ['Vencimiento', validarVencimiento],
  'pago.cvv': ['CVV', validarCvv],
  'pago.titular': ['Titular de la tarjeta', validarTitular],
};

export const camposPorPaso = {
  1: ['equipo.marca', 'equipo.modelo', 'equipo.valor', 'equipo.antiguedad'],
  3: ['titular.nombre', 'titular.apellido', 'titular.dni', 'titular.nacimiento', 'titular.email', 'titular.celular', 'titular.terminos'],
  4: ['pago.tarjeta', 'pago.vencimiento', 'pago.cvv', 'pago.titular'],
};
