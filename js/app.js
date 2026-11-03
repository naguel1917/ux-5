import { solicitud, irAPaso, leer, escribir, reiniciar } from './estado.js';
import { reglas, camposPorPaso } from './validaciones.js';
import { simularPago, generarPoliza } from './pago.js';

const $ = (s) => document.querySelector(s);
const tocados = new Set();
let procesando = false;

const campoDe = (ruta) => $(`[data-field="${ruta}"]`);
const errores = (paso) => (camposPorPaso[paso] || []).map((r) => [r, reglas[r][1](leer(r))]).filter(([, m]) => m);

function mostrarError(ruta, msg) {
  const f = campoDe(ruta);
  const p = f.querySelector('[data-error]');
  f.toggleAttribute('data-invalid', !!msg);
  f.querySelectorAll('[data-campo]').forEach((i) => (msg ? i.setAttribute('aria-invalid', 'true') : i.removeAttribute('aria-invalid')));
  p.textContent = msg || '';
  p.hidden = !msg;
}
const validarCampo = (ruta) => mostrarError(ruta, reglas[ruta][1](leer(ruta)));

function limpiarErrores() {
  tocados.clear();
  document.querySelectorAll('[data-field]').forEach((f) => mostrarError(f.dataset.field, ''));
}

function actualizarBoton(paso) {
  const faltan = errores(paso);
  const btn = $(`[data-paso="${paso}"] button[type="submit"]`);
  if (btn && !procesando) btn.disabled = faltan.length > 0;
  const ayuda = $(`[data-falta="${paso}"]`);
  if (ayuda) ayuda.textContent = faltan.length ? `Falta completar: ${faltan.map(([r]) => reglas[r][0]).join(', ')}.` : '';
}

const ir = (n) => { irAPaso(n); actualizarBoton(n); };

function guardar(el) {
  const r = el.dataset.campo;
  if (r === 'pago.tarjeta') el.value = el.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
  if (r === 'pago.vencimiento') { const d = el.value.replace(/\D/g, '').slice(0, 4); el.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; }
  if (el.type === 'checkbox') escribir(r, el.checked);
  else if (r === 'equipo.valor') escribir(r, Number(el.value.replace(/\D/g, '')) || 0);
  else escribir(r, el.value);
}

document.addEventListener('input', (e) => {
  const r = e.target.dataset.campo;
  if (!r) return;
  guardar(e.target);
  if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') tocados.add(r);
  if (tocados.has(r)) validarCampo(r);
  actualizarBoton(solicitud.paso);
});

// Error en línea al salir del campo (blur).
document.addEventListener('focusout', (e) => {
  const r = e.target.dataset?.campo;
  if (!r || e.target.type === 'radio' || e.target.type === 'checkbox') return;
  tocados.add(r);
  validarCampo(r);
});

document.addEventListener('change', (e) => {
  if (e.target.name === 'plan') { solicitud.plan = e.target.value; irAPaso(2); }
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ir], [data-accion]');
  if (!b) return;
  if (b.dataset.ir !== undefined) ir(Number(b.dataset.ir));
  if (b.dataset.accion === 'reiniciar') { reiniciar(); limpiarErrores(); ir(0); }
  if (b.dataset.accion === 'cambiar-medio') { ir(4); $('[data-campo="pago.metodo"]').focus(); }
});

document.addEventListener('submit', (e) => {
  e.preventDefault();
  const paso = solicitud.paso;
  const errs = errores(paso);
  if (errs.length) {
    errs.forEach(([r, m]) => { tocados.add(r); mostrarError(r, m); });
    campoDe(errs[0][0]).querySelector('[data-campo]').focus();
    return;
  }
  if (paso === 1) cotizar();
  if (paso === 3) ir(4);
  if (paso === 4) pagar();
});

async function cotizar() {
  const aviso = $('#aviso-planes');
  aviso.hidden = true;
  try {
    if (!solicitud.planes.length) {
      const res = await fetch('data/planes.json');
      if (!res.ok) throw new Error(res.status);
      solicitud.planes = await res.json();
    }
    ir(2);
  } catch {
    aviso.hidden = false;
  }
}

async function pagar() {
  if (procesando) return; // evita el doble click
  procesando = true;
  const btn = $('[data-paso="4"] button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Procesando…';
  const res = await simularPago(solicitud.pago.tarjeta);
  procesando = false;
  btn.textContent = 'Pagar y contratar';
  if (res.ok) {
    solicitud.poliza = generarPoliza();
    solicitud.pago.cvv = '';
    ir(5);
  } else {
    solicitud.errorPago = res.motivo;
    ir(6);
  }
}

irAPaso(0);
[1, 3, 4].forEach(actualizarBoton);
