# Sistema de movimiento (UI/UX)

Criterio **global**: toda interacción con recorrido tiene una transición sutil y
congruente. Nada aparece/desaparece de golpe. Aplicar esto también a cada sección
y función nueva.

## Tokens (definidos en `src/app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22,1,0.36,1)` | entradas y aperturas (desacelera al final) |
| `--ease-in-out` | `cubic-bezier(0.65,0,0.35,1)` | movimientos continuos (colapsos, slides) |
| `--ease-emphasized` | `cubic-bezier(0.2,0,0,1)` | énfasis puntual |
| `--dur-micro` | `160ms` | switches, hover, foco, ítems |
| `--dur` | `200ms` | overlays (dropdown, select, tooltip, toast) |
| `--dur-panel` | `320ms` | paneles grandes (sheet, sidebar) |

## Reglas por tipo de componente

- **Navegación entre vistas**: cada ruta entra con fade + leve subida (`view-enter`,
  vía `template.tsx` en `(site)` y `admin/(dash)`). No hay cortes secos.
- **Overlay central / toast**: spawn con desplazamiento (fade + zoom/slide), no pop seco.
- **Dropdown / menú**: popup con fade+zoom y sus ítems en **cascade** (entran escalonados).
- **Select**: popup animado; las opciones también cascade. Nunca el `<select>` nativo del SO.
- **Switch**: el thumb **desliza** (`transition-transform`), no salta.
- **Sheet / sidebar**: deslizan desde el borde con `--ease-in-out`.
- **Hover / foco / estado**: microtransición de color/opacidad/sombra (`--dur-micro`).

## Accesibilidad

`@media (prefers-reduced-motion: reduce)` neutraliza animaciones y transiciones
(quedan ~instantáneas) manteniendo todo usable. Respetarlo siempre.

## Al agregar algo nuevo

1. ¿Tiene recorrido (abre, cierra, cambia, se desplaza)? → debe animar.
2. Usá los tokens, no números mágicos.
3. Entrada = `--ease-out`; continuo = `--ease-in-out`.
4. Preferí componentes de `components/ui/*` (ya traen el movimiento correcto):
   `Select`, `Switch`, `Sheet`, `DropdownMenu`, `Tooltip`, `Accordion`, sidebar.
5. Verificá con reduced-motion activado.
