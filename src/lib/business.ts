// Datos internos/operativos del negocio (Configuración → General).
// Módulo PURO (sin imports de servidor) → se puede usar en cliente.
// La lectura desde Supabase está en business.server.ts.

export const CONDICIONES_IVA = [
  "Responsable Inscripto",
  "Monotributo",
  "Exento",
  "Consumidor Final",
] as const;

export type CondicionIva = (typeof CONDICIONES_IVA)[number] | "";

export type BusinessSettings = {
  legal: { razonSocial: string; cuit: string; condicionIva: CondicionIva };
  ubicacion: {
    direccion: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  operacion: { zonaEntrega: string; horarios: string; diasAtencion: string };
  interno: { notas: string };
};

export const defaultBusiness: BusinessSettings = {
  legal: { razonSocial: "", cuit: "", condicionIva: "" },
  ubicacion: {
    direccion: "",
    ciudad: "Buenos Aires",
    provincia: "Buenos Aires",
    codigoPostal: "",
  },
  operacion: { zonaEntrega: "", horarios: "", diasAtencion: "" },
  interno: { notas: "" },
};

// Merge superficial por sección (lo guardado pisa el default; lo ausente queda).
export function mergeBusiness(
  override: Partial<BusinessSettings> | null | undefined,
): BusinessSettings {
  const o = override ?? {};
  return {
    legal: { ...defaultBusiness.legal, ...o.legal },
    ubicacion: { ...defaultBusiness.ubicacion, ...o.ubicacion },
    operacion: { ...defaultBusiness.operacion, ...o.operacion },
    interno: { ...defaultBusiness.interno, ...o.interno },
  };
}
