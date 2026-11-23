import { z } from "zod";

export const eventSlugs = [
  "15",
  "18",
  "bodas",
  "infantiles",
  "bat-mitzvah",
  "egresos",
] as const;

export const leadItemSchema = z.object({
  slug: z.string().min(1),
  qty: z.number().int().min(1).max(100000),
  name: z.string().max(200).optional(), // snapshot del nombre al momento del pedido
});

export const leadSchema = z.object({
  name: z.string().min(2, "Decinos tu nombre").max(80),
  phone: z
    .string()
    .min(6, "Ingresá un teléfono válido")
    .max(30),
  email: z.union([z.literal(""), z.email("Email inválido")]).optional(),
  event: z.enum(eventSlugs).optional(),
  date: z.string().max(20).optional(),
  guests: z.number().int().min(0).max(100000).optional(),
  items: z.array(leadItemSchema).min(1, "Elegí al menos un producto"),
  comments: z.string().max(1000).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
