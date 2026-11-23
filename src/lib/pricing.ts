// Estimación del cotizador.
//
// El precio orientativo por producto vive en `price_from` (DB) / `priceFrom`
// (mock). El cotizador suma qty × priceFrom.
//
// showEstimate controla si se MUESTRA el monto en pesos. Default false:
// la máquina calcula, pero no exponemos números hasta que el cliente confirme
// precios reales (cargar price_from en la DB y poner showEstimate = true).
//
// TODO(cliente): cargar price_from reales + poner showEstimate = true.
export const showEstimate = false;

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatArs(n: number): string {
  return ars.format(n);
}
