// Config central del sitio. Editar acá marca, contacto y navegación.
// TODO(branding): reemplazar valores cuando llegue el Drive del cliente.

export const site = {
  name: "Alma Creativa",
  tagline: "Papelería creativa para eventos que se recuerdan",
  description:
    "Diseño, impresión y armado de papelería premium para eventos sociales en Buenos Aires: invitaciones temáticas, números de mesa, souvenirs, chocolatitos, raspaditas y más.",
  city: "Buenos Aires, Argentina",
  instagram: "almacreativa.eventos",
  instagramUrl: "https://instagram.com/almacreativa.eventos",
  // TODO(cliente): número real de WhatsApp (formato internacional sin +, ni espacios).
  whatsapp: "5491100000000",
  email: "hola@almacreativa.com.ar",
  url: "https://almacreativa.com.ar",
} as const;

export function waLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/#proceso", label: "Cómo pedir" },
] as const;
