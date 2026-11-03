import { solicitud, leer } from './estado.js';
import { calcularCuota, formatoARS } from './cotizador.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const planActual = () => solicitud.planes.find((p) => p.id === solicitud.plan);
const cuotaDe = (plan) => calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad);
const nombreCompleto = () => `${solicitud.titular.nombre} ${solicitud.titular.apellido}`.trim();
const filas = (lista) => lista.map(([k, v]) => `<div class="flex justify-between gap-4 text-sm"><dt class="text-slate-500">${k}</dt><dd class="text-right font-semibold">${esc(v)}</dd></div>`).join('');

export function render() {
  const p = solicitud.paso;
  document.querySelectorAll('[data-paso]').forEach((s) => { s.hidden = Number(s.dataset.paso) !== p; });
  $('#checkout').hidden = !(p >= 1 && p <= 4);
  sincronizarCampos();
  renderPlanes();
  renderStepper();
  renderResumen();
  renderFinal();
}

// Rellena los inputs desde el estado (así "Volver" no pierde datos).
function sincronizarCampos() {
  document.querySelectorAll('[data-campo]').forEach((el) => {
    const v = leer(el.dataset.campo);
    if (el.type === 'radio') el.checked = el.value === v;
    else if (el.type === 'checkbox') el.checked = !!v;
    else el.value = el.dataset.campo === 'equipo.valor' && !v ? '' : v;
  });
}

function renderPlanes() {
  const c = $('#planes');
  const e = solicitud.equipo;
  const clave = `${e.valor}|${e.antiguedad}|${solicitud.planes.length}`;
  if (c.dataset.clave !== clave) {
    c.dataset.clave = clave;
    c.innerHTML = solicitud.planes.map((pl) => `
      <label class="cursor-pointer rounded-xl has-[:checked]:ring-2 has-[:checked]:ring-indigo-600 has-[:focus-visible]:outline-2">
        <div class="card h-full gap-3 p-4">
          <div class="flex items-center justify-between"><h3 class="text-lg font-bold">${esc(pl.nombre)}</h3>${pl.recomendado ? '<span class="badge">Recomendado</span>' : ''}</div>
          <p class="text-2xl font-extrabold text-indigo-800">${formatoARS(cuotaDe(pl))}<span class="text-sm font-normal text-slate-500"> /mes</span></p>
          <ul class="space-y-1 text-sm text-slate-500">${pl.coberturas.map((x) => `<li>✓ ${esc(x)}</li>`).join('')}</ul>
          <input type="radio" name="plan" value="${pl.id}" class="mt-auto" aria-label="Elegir plan ${esc(pl.nombre)}">
        </div>
      </label>`).join('');
  }
  c.querySelectorAll('input').forEach((i) => { i.checked = i.value === solicitud.plan; });
}

const NOMBRES = ['Cotizar', 'Plan', 'Datos', 'Pago'];
function renderStepper() {
  const p = solicitud.paso;
  const el = $('#stepper');
  el.hidden = p === 0;
  const actual = p === 5 ? 5 : p === 6 ? 4 : p;
  el.innerHTML = NOMBRES.map((n, i) => {
    const k = i + 1;
    const est = p === 6 && k === 4 ? 'error' : k < actual ? 'completo' : k === actual ? 'activo' : 'pendiente';
    const color = { completo: 'bg-emerald-600 text-white', activo: 'bg-indigo-600 text-white', error: 'bg-red-600 text-white', pendiente: 'bg-slate-200 text-slate-500' }[est];
    const texto = est === 'pendiente' ? 'text-slate-500' : 'font-semibold text-slate-900';
    return `${i ? '<li class="h-px flex-1 bg-slate-300" aria-hidden="true"></li>' : ''}
      <li class="flex items-center gap-2" ${est === 'activo' || est === 'error' ? 'aria-current="step"' : ''}>
        <span class="grid size-7 place-items-center rounded-full text-sm font-bold ${color}">${est === 'completo' ? '✓' : k}</span>
        <span class="text-sm ${texto} ${est === 'activo' || est === 'error' ? '' : 'hidden sm:inline'}">${n}</span>
      </li>`;
  }).join('');
}

// Se genera una sola vez; en mobile es una barra fija y en desktop una card lateral.
function renderResumen() {
  const s = solicitud;
  const pl = planActual();
  const visible = s.paso >= 2 && s.paso <= 4 && !!pl;
  $('#resumen').hidden = !visible;
  $('#checkout').toggleAttribute('data-resumen', visible);
  if (!visible) return;
  const f = [['Seguro', 'Celular'], ['Equipo', `${s.equipo.marca} ${s.equipo.modelo}`], ['Valor', formatoARS(s.equipo.valor)], ['Plan', pl.nombre]];
  if (s.paso >= 4) f.push(['Titular', nombreCompleto()], ['Email', s.titular.email]);
  $('#resumen-detalle').innerHTML = filas(f);
  $('#resumen-plan').textContent = pl.nombre;
  $('#resumen-total').textContent = formatoARS(cuotaDe(pl));
}

function renderFinal() {
  const s = solicitud;
  const pl = planActual();
  if (s.paso === 5 && pl) {
    $('#exito-nombre').textContent = s.titular.nombre;
    $('#exito-email').textContent = s.titular.email;
    $('#exito-poliza').textContent = s.poliza;
    $('#exito-detalle').innerHTML = filas([['Titular', nombreCompleto()], ['Equipo', `${s.equipo.marca} ${s.equipo.modelo}`], ['Plan', pl.nombre], ['Cobertura', pl.coberturas.join(', ')], ['Cuota mensual', formatoARS(cuotaDe(pl))]]);
  }
  if (s.paso === 6) $('#error-motivo').textContent = s.errorPago;
}
