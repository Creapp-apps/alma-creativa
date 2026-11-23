// Tipos del catálogo + datos de ejemplo (MOCK).
// El MOCK es el fallback cuando Supabase no está configurado.
// El shape coincide con lo que devuelve la DB (ver src/lib/catalog.ts).
// Los íconos son NOMBRES (string) que se resuelven con src/lib/icons.ts.

export type EventSlug =
  | "15"
  | "18"
  | "bodas"
  | "infantiles"
  | "bat-mitzvah"
  | "egresos";

export type CategorySlug =
  | "invitaciones"
  | "numeros-mesa"
  | "chocolatitos"
  | "raspaditas"
  | "caretas"
  | "pulseras-qr"
  | "trofeos"
  | "souvenirs";

export type Category = {
  slug: string;
  name: string;
  short: string;
  icon: string; // nombre lucide
  tint: string;
  imageUrl: string | null;
  focal: string; // object-position, p.ej. "50% 40%"
};

export type EventType = {
  slug: string;
  name: string;
  blurb: string;
  imageUrl: string | null;
  focal: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  categoryTint: string;
  events: string[];
  blurb: string;
  details: string[];
  priceNote: string;
  priceFrom: number;
  featured: boolean;
  imageUrl: string | null;
  focal: string;
};

const rawCategories: Omit<Category, "imageUrl" | "focal">[] = [
  { slug: "invitaciones", name: "Invitaciones temáticas", short: "Diseño e impresión a tono con tu evento.", icon: "Mail", tint: "#e9dcc0" },
  { slug: "numeros-mesa", name: "Números de mesa", short: "Identificadores y señalética de salón.", icon: "Hash", tint: "#dfe3d6" },
  { slug: "chocolatitos", name: "Chocolates personalizados", short: "Detalles dulces con tu identidad.", icon: "Candy", tint: "#f0d9d2" },
  { slug: "raspaditas", name: "Raspaditas", short: "Dinámicas y sorteos para la fiesta.", icon: "Ticket", tint: "#e3dbea" },
  { slug: "caretas", name: "Caretas y props", short: "Accesorios para la pista y las fotos.", icon: "VenetianMask", tint: "#d8e4e6" },
  { slug: "pulseras-qr", name: "Pulseras con QR", short: "Acceso, playlist o galería en un escaneo.", icon: "QrCode", tint: "#dde0ea" },
  { slug: "trofeos", name: "Trofeos Martín Fierro", short: "Premiaciones y momentos para recordar.", icon: "Trophy", tint: "#ecdfc2" },
  { slug: "souvenirs", name: "Souvenirs", short: "El recuerdo que se llevan tus invitados.", icon: "Gift", tint: "#e8dce4" },
];

export const categories: Category[] = rawCategories.map((c) => ({
  ...c,
  imageUrl: null,
  focal: "50% 50%",
}));

const rawEvents: Omit<EventType, "imageUrl" | "focal">[] = [
  { slug: "15", name: "Fiesta de 15", blurb: "La noche más esperada, en cada detalle." },
  { slug: "18", name: "Cumpleaños de 18", blurb: "Mayoría de edad con estilo propio." },
  { slug: "bodas", name: "Casamientos", blurb: "Papelería elegante de principio a fin." },
  { slug: "infantiles", name: "Infantiles", blurb: "Personajes y color para los más chicos." },
  { slug: "bat-mitzvah", name: "Bat / Bar Mitzvah", blurb: "Una celebración con significado." },
  { slug: "egresos", name: "Egresos", blurb: "El cierre de una etapa, bien festejado." },
];

export const events: EventType[] = rawEvents.map((e) => ({
  ...e,
  imageUrl: null,
  focal: "50% 50%",
}));

type RawProduct = Omit<
  Product,
  "categoryName" | "categoryIcon" | "categoryTint" | "imageUrl" | "focal"
>;

const rawProducts: RawProduct[] = [
  { slug: "invitacion-tematica-premium", name: "Invitación temática premium", category: "invitaciones", events: ["15", "bodas", "18"], blurb: "Diseño exclusivo, impresión fina y terminaciones a elección.", details: ["Diseño 100% a medida del evento", "Papeles de alto gramaje y texturas", "Terminaciones: foil, relieve, troquelado", "Sobre y faja opcionales"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: true },
  { slug: "invitacion-digital-animada", name: "Invitación digital animada", category: "invitaciones", events: ["15", "18", "egresos"], blurb: "Versión animada para compartir por WhatsApp y redes.", details: ["Animación breve", "Datos y ubicación", "Confirmación de asistencia"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: false },
  { slug: "numeros-mesa-tematicos", name: "Números de mesa temáticos", category: "numeros-mesa", events: ["bodas", "15", "bat-mitzvah"], blurb: "Identificadores a tono con la ambientación del salón.", details: ["Diseño coordinado", "Base rígida o soporte", "Set completo por cantidad de mesas"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: true },
  { slug: "cartel-bienvenida", name: "Cartel de bienvenida", category: "numeros-mesa", events: ["bodas", "15", "egresos"], blurb: "Señalética de ingreso para recibir a tus invitados.", details: ["Gran formato", "Atril opcional", "Diseño coordinado con la invitación"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: false },
  { slug: "chocolatitos-personalizados", name: "Chocolatitos personalizados", category: "chocolatitos", events: ["15", "18", "infantiles", "egresos"], blurb: "Envoltorios impresos con el nombre y la temática.", details: ["Diseño de envoltorio", "Cantidades por invitado", "Armado incluido"], priceNote: "Desde pedido mínimo", priceFrom: 0, featured: true },
  { slug: "raspadita-sorteo", name: "Raspadita de sorteo", category: "raspaditas", events: ["15", "18", "egresos"], blurb: "Dinámica interactiva para premiar en plena fiesta.", details: ["Capa raspable real", "Premios configurables", "Diseño a tono"], priceNote: "Desde pedido mínimo", priceFrom: 0, featured: false },
  { slug: "caretas-foto", name: "Caretas para fotos", category: "caretas", events: ["15", "18", "infantiles", "egresos"], blurb: "Props para la pista y el rincón de fotos.", details: ["Set temático", "Cartón rígido", "Varilla incluida"], priceNote: "Desde pedido mínimo", priceFrom: 0, featured: false },
  { slug: "pulsera-qr-acceso", name: "Pulsera con QR", category: "pulseras-qr", events: ["15", "18", "egresos", "bodas"], blurb: "Acceso, lista de temas o galería compartida en un escaneo.", details: ["QR a medida", "Material resistente", "Enlace configurable"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: true },
  { slug: "trofeo-martin-fierro", name: "Trofeo Martín Fierro", category: "trofeos", events: ["egresos", "18", "15"], blurb: "Premiación con estilo para los momentos más divertidos.", details: ["Diseño del galardón", "Placa personalizada", "Por cantidad de categorías"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: false },
  { slug: "souvenir-personalizado", name: "Souvenir personalizado", category: "souvenirs", events: ["15", "bodas", "bat-mitzvah", "infantiles"], blurb: "El recuerdo que se llevan tus invitados a casa.", details: ["Diseño a medida", "Varios formatos", "Armado y packaging"], priceNote: "Desde pedido mínimo", priceFrom: 0, featured: false },
  { slug: "kit-mesa-dulce", name: "Kit mesa dulce", category: "souvenirs", events: ["15", "infantiles", "bodas"], blurb: "Papelería coordinada para la mesa dulce: etiquetas, toppers y banderines.", details: ["Toppers y banderines", "Etiquetas para frascos", "Cartelería menor"], priceNote: "Presupuesto a medida", priceFrom: 0, featured: false },
  { slug: "invitacion-infantil", name: "Invitación infantil", category: "invitaciones", events: ["infantiles"], blurb: "Personajes, color y diversión para los más chicos.", details: ["Temática del personaje", "Impresión a color", "Sobre opcional"], priceNote: "Desde pedido mínimo", priceFrom: 0, featured: false },
];

function enrich(p: RawProduct): Product {
  const cat = categories.find((c) => c.slug === p.category);
  return {
    ...p,
    categoryName: cat?.name ?? p.category,
    categoryIcon: cat?.icon ?? "Package",
    categoryTint: cat?.tint ?? "#efeae1",
    imageUrl: null,
    focal: "50% 50%",
  };
}

export const products: Product[] = rawProducts.map(enrich);

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}
