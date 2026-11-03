import { render } from './render.js';

const estadoInicial = () => ({
  paso: 0, // 0 = inicio, 1..4 = checkout, 5 = éxito, 6 = error
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' },
  poliza: null,
  planes: [],      // cargados desde data/planes.json
  errorPago: '',
});

export const solicitud = estadoInicial();

export function irAPaso(n) {
  solicitud.paso = n;
  render(); // siempre después de cambiar el estado
  window.scrollTo(0, 0);
}

export const leer = (ruta) => { const [a, b] = ruta.split('.'); return solicitud[a][b]; };
export const escribir = (ruta, valor) => { const [a, b] = ruta.split('.'); solicitud[a][b] = valor; };
export const reiniciar = () => Object.assign(solicitud, estadoInicial());
