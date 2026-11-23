// Contenido editable del sitio (autogestión). Tipos + defaults + merge.
// Módulo PURO (sin imports de servidor) → se puede usar en cliente.
// La lectura desde Supabase está en site-content.server.ts.

export type Step = { title: string; text: string };

export type FontPreset = "fraunces" | "outfit" | "playfair";

export type SiteContent = {
  appearance: {
    logoUrl: string | null;
    colors: { paper: string; ink: string; gold: string };
    font: FontPreset;
  };
  brand: { name: string; tagline: string; city: string };
  contact: { whatsapp: string; email: string; instagram: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    media: { url: string | null; focal: string };
  };
  categorias: { title: string; subtitle: string };
  destacados: { title: string; subtitle: string };
  eventos: { title: string; subtitle: string };
  proceso: { title: string; subtitle: string; steps: Step[] };
  ctaFinal: { title: string; subtitle: string };
};

export const defaultContent: SiteContent = {
  appearance: {
    logoUrl: null,
    colors: { paper: "#faf7f2", ink: "#211e26", gold: "#8a6e35" },
    font: "fraunces",
  },
  brand: {
    name: "Alma Creativa",
    tagline: "Papelería creativa para eventos que se recuerdan",
    city: "Buenos Aires, Argentina",
  },
  contact: {
    whatsapp: "5491100000000",
    email: "hola@almacreativa.com.ar",
    instagram: "almacreativa.eventos",
  },
  hero: {
    eyebrow: "Papelería de autor",
    titleLead: "Que cada detalle de tu evento",
    titleAccent: "cuente una historia.",
    body: "Diseñamos, imprimimos y armamos la papelería de tu fiesta: invitaciones temáticas, números de mesa, souvenirs y todos esos detalles que vuelven inolvidable una celebración.",
    ctaPrimary: "Pedí tu presupuesto",
    ctaSecondary: "Ver catálogo",
    media: { url: null, focal: "50% 50%" },
  },
  categorias: {
    title: "Lo que hacemos",
    subtitle:
      "Todo el material gráfico de tu evento, coordinado bajo una misma identidad.",
  },
  destacados: {
    title: "Destacados",
    subtitle: "Algunos de los pedidos que más nos piden para cada fiesta.",
  },
  eventos: {
    title: "Para cada celebración",
    subtitle: "Adaptamos cada pieza al tono y la temática de tu evento.",
  },
  proceso: {
    title: "Cómo pedir",
    subtitle: "Tres pasos, todo por WhatsApp. Sin vueltas.",
    steps: [
      {
        title: "Contanos tu evento",
        text: "Nos escribís por WhatsApp con la fecha, la temática y qué necesitás.",
      },
      {
        title: "Diseñamos e imprimimos",
        text: "Armamos una propuesta a medida, la aprobás y pasamos a impresión.",
      },
      {
        title: "Lo recibís listo",
        text: "Entregamos la papelería armada y lista para tu gran día.",
      },
    ],
  },
  ctaFinal: {
    title: "¿Tenés una fecha en mente? Hagamos que se note.",
    subtitle: "Contanos tu evento y armamos una propuesta a tu medida.",
  },
};

// Merge superficial por sección (lo guardado pisa el default; lo ausente queda).
export function mergeContent(
  override: Partial<SiteContent> | null | undefined,
): SiteContent {
  const o = override ?? {};
  return {
    appearance: {
      ...defaultContent.appearance,
      ...o.appearance,
      colors: {
        ...defaultContent.appearance.colors,
        ...o.appearance?.colors,
      },
    },
    brand: { ...defaultContent.brand, ...o.brand },
    contact: { ...defaultContent.contact, ...o.contact },
    hero: {
      ...defaultContent.hero,
      ...o.hero,
      media: { ...defaultContent.hero.media, ...o.hero?.media },
    },
    categorias: { ...defaultContent.categorias, ...o.categorias },
    destacados: { ...defaultContent.destacados, ...o.destacados },
    eventos: { ...defaultContent.eventos, ...o.eventos },
    proceso: {
      ...defaultContent.proceso,
      ...o.proceso,
      steps:
        o.proceso?.steps && o.proceso.steps.length > 0
          ? o.proceso.steps
          : defaultContent.proceso.steps,
    },
    ctaFinal: { ...defaultContent.ctaFinal, ...o.ctaFinal },
  };
}

const FONT_STACKS: Record<FontPreset, { display: string; sans: string } | null> =
  {
    fraunces: null, // usa las fuentes por defecto (next/font)
    outfit: { display: '"Outfit", sans-serif', sans: '"Space Grotesk", sans-serif' },
    playfair: {
      display: '"Playfair Display", serif',
      sans: '"Inter", sans-serif',
    },
  };

// Variables CSS que personalizan el sitio público (se aplican al wrapper del sitio).
export function appearanceVars(
  a: SiteContent["appearance"],
): Record<string, string> {
  const vars: Record<string, string> = {
    "--background": a.colors.paper,
    "--foreground": a.colors.ink,
    "--primary": a.colors.ink,
    "--primary-foreground": a.colors.paper,
    "--gold": a.colors.gold,
    "--ring": a.colors.gold,
  };
  const f = FONT_STACKS[a.font];
  if (f) {
    vars["--font-display"] = f.display;
    vars["--font-sans"] = f.sans;
  }
  return vars;
}

export function waLink(whatsapp: string, message?: string) {
  const base = `https://wa.me/${whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
