# Cubrí Seguros · Flujo de contratación digital (Seguro de Celular)
LINK DEL NETLIFY:https://coruscating-macaron-b34430.netlify.app/
TP5 · Diseño UXUI 2026 · Licenciatura en Sistemas de Información (FCyT).
Stack: HTML5 · Tailwind CSS v4 (CDN) · Basecoat UI · JavaScript vanilla (módulos ES).

- **Sitio publicado:** _pegar URL acá_
- **Figma:** https://www.figma.com/design/vJrfOUfiOI7OSeTtRfCloh

## Cómo correrlo
Los módulos ES y `fetch('data/planes.json')` no funcionan con doble click (`file://`). Usá un servidor local:

```bash
npx serve        # o la extensión Live Server de VS Code
```

## Estructura
```
index.html          7 pantallas como <section data-paso>
css/tokens.css      tokens del Figma (primary, radius, etc.)
data/planes.json    planes cargados con fetch
js/app.js           arranque, eventos y navegación
js/estado.js        objeto `solicitud` + irAPaso()
js/render.js        pinta pasos, stepper, planes y resumen desde el estado
js/validaciones.js  funciones puras (mensaje o null) + reglas por paso
js/cotizador.js     calcularCuota() y formato de moneda
js/pago.js          simularPago() y generarPoliza()
```

## Decisiones
- **Un único estado** (`solicitud`): cada evento lo modifica y luego se llama a `render()`; el DOM nunca se lee para calcular.
- **Resumen único**: `renderResumen()` genera un solo `<aside>`; en mobile es una barra fija inferior y en desktop (`lg:`) una card lateral de 380 px.
- **Validación en el momento justo**: error en `blur`; el botón de avance queda deshabilitado con un texto que indica qué falta; al intentar enviar se revalida todo y se enfoca el primer error.
- **Pago**: botón deshabilitado durante el proceso (sin doble click); si falla vuelve al paso 4 con todo cargado.
- **Vencimiento**: la tarjeta es válida hasta el último día del mes indicado.

## Casos de prueba (sección 5.1)
| Valor | Antigüedad | Básico | Plus | Premium |
|---|---|---|---|---|
| $600.000 | menos de 1 año | $2.000 | $3.000 | $4.500 |
| $600.000 | 1 a 2 años | $2.200 | $3.300 | $4.950 |
| $1.200.000 | más de 2 años | $5.000 | $7.500 | $11.250 |

Tarjetas de prueba: `4111 1111 1111 1111` (aprobada) · `4000 0000 0000 0002` (rechazada).

## Bonus
- Máscaras de input: tarjeta en grupos de 4 y vencimiento con barra automática.

## Capturas
_Agregar capturas mobile (390 px) y desktop (1440 px) de las 7 pantallas._
