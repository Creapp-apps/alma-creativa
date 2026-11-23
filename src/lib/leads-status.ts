export const LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "presupuestado",
  "ganado",
  "perdido",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
