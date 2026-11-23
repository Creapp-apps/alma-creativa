export const PRODUCTION_STAGES = [
  "pendiente",
  "en_produccion",
  "listo",
  "entregado",
] as const;

export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export const STAGE_LABEL: Record<ProductionStage, string> = {
  pendiente: "Pendiente",
  en_produccion: "En producción",
  listo: "Listo",
  entregado: "Entregado",
};

export function isProductionStage(v: string): v is ProductionStage {
  return (PRODUCTION_STAGES as readonly string[]).includes(v);
}
