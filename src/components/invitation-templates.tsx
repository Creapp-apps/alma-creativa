"use client";

/* =========================================================================
   PLANTILLAS DE INVITACIÓN — recreación en CSS del estilo real de Alma.
   No son copias calcadas de una pieza: reconstruyen la "gramática" de cada
   mundo (clásica, noche, primavera, gótica) de forma parametrizable, para
   que el previsualizador se sienta real y propio de la marca.
   Cada plantilla recibe los mismos datos y los compone a su manera.
   ========================================================================= */

export type InvitationData = {
  eyebrow: string; // frase chica de arriba
  headline: string; // palabra protagonista
  subline: string; // subfrase
  name: string; // nombre / firma
  date: string; // fecha
};

export type TemplateId = "clasica" | "noche" | "primavera" | "gotica";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  sample: InvitationData;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "clasica",
    label: "Clásica",
    sample: {
      eyebrow: "Los mejores momentos de la vida merecen ser compartidos",
      headline: "Gracias",
      subline: "por celebrar conmigo",
      name: "Ornella",
      date: "29.08.2026",
    },
  },
  {
    id: "noche",
    label: "Noche",
    sample: {
      eyebrow: "Emi XV",
      headline: "Gracias",
      subline: "por acompañarme esta noche tan especial",
      name: "Emilia",
      date: "15.08.2026",
    },
  },
  {
    id: "primavera",
    label: "Primavera",
    sample: {
      eyebrow: "Equipo Costanera",
      headline: "Feliz",
      subline: "primavera",
      name: "Caro, Marcos y Tati",
      date: "21.09.2026",
    },
  },
  {
    id: "gotica",
    label: "Gótica",
    sample: {
      eyebrow: "Alu XV",
      headline: "Gracias",
      subline: "por ser parte de esta noche inolvidable",
      name: "Alumine",
      date: "15.08.2026",
    },
  },
];

const SCRIPT = '"Dancing Script", cursive';
const SERIF = '"Cormorant Garamond", "Playfair Display", serif';
const BLACK = '"UnifrakturCook", "Cormorant Garamond", serif';

/* ---- Piezas SVG reutilizables ---- */

function Heart({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 21s-7.5-4.6-9.8-9C.9 9.3 2 6 5 6c1.9 0 3.1 1.1 3.9 2.3C9.9 7.1 11.1 6 13 6c3 0 4.1 3.3 2.8 6-2.3 4.4-9.8 9-9.8 9z" />
    </svg>
  );
}

function Star8({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 0l1.6 8.4L22 6l-6.2 6 6.2 6-8.4-2.4L12 24l-1.6-8.4L2 18l6.2-6L2 6l8.4 2.4z" />
    </svg>
  );
}

function Sprig({ color }: { color: string }) {
  return (
    <svg width="34" height="46" viewBox="0 0 34 46" fill="none" aria-hidden>
      <path d="M17 46V6" stroke={color} strokeWidth="1.2" />
      {[12, 20, 28, 36].map((y, i) => (
        <g key={y}>
          <path
            d={`M17 ${y} C ${17 - 9} ${y - 3}, ${17 - 11} ${y + 2}, ${17 - 12} ${y + 6}`}
            stroke={color}
            strokeWidth="1.1"
            fill="none"
          />
          <path
            d={`M17 ${y} C ${17 + 9} ${y - 3}, ${17 + 11} ${y + 2}, ${17 + 12} ${y + 6}`}
            stroke={color}
            strokeWidth="1.1"
            fill="none"
          />
        </g>
      ))}
      <circle cx="17" cy="5" r="2.4" fill={color} />
    </svg>
  );
}

function Flower({ petal, leaf }: { petal: string; leaf: string }) {
  return (
    <svg width="56" height="64" viewBox="0 0 56 64" fill="none" aria-hidden>
      <path d="M20 64 C 16 44, 10 40, 4 38" stroke={leaf} strokeWidth="1.4" />
      <path d="M36 64 C 40 44, 46 40, 52 38" stroke={leaf} strokeWidth="1.4" />
      <path d="M12 46 q -6 -2 -9 -8 q 7 -1 11 4 z" fill={leaf} opacity="0.8" />
      <path d="M44 46 q 6 -2 9 -8 q -7 -1 -11 4 z" fill={leaf} opacity="0.8" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="28"
          cy="18"
          rx="5"
          ry="9"
          fill={petal}
          transform={`rotate(${a} 28 26)`}
        />
      ))}
      <circle cx="28" cy="26" r="4" fill={leaf} />
    </svg>
  );
}

function CornerFlourish({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M4 4 C 4 26, 14 30, 30 30 M4 4 C 26 4, 30 14, 30 30 M4 14 C 4 26, 10 30, 20 31 M14 4 C 26 4, 31 10, 31 20"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.75"
      />
      <circle cx="4" cy="4" r="2" fill={color} opacity="0.8" />
    </svg>
  );
}

/* ---- Plantillas ---- */

function Clasica({ d }: { d: InvitationData }) {
  const ink = "#4b3b7a";
  const soft = "#f4f1fb";
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-between px-7 py-9 text-center"
      style={{ background: `linear-gradient(170deg, #ffffff, ${soft})`, color: ink }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="self-end -mr-1 -mt-1">
          <Sprig color={`${ink}66`} />
        </div>
        <Heart color={ink} size={18} />
        <p className="text-[0.62rem] uppercase leading-relaxed tracking-[0.18em]" style={{ opacity: 0.85 }}>
          {d.eyebrow}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p style={{ fontFamily: SCRIPT, fontSize: "3.1rem", lineHeight: 1, color: ink }}>
          {d.headline}
        </p>
        <p className="text-[0.66rem] uppercase tracking-[0.22em]" style={{ opacity: 0.9 }}>
          {d.subline}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p style={{ fontFamily: SCRIPT, fontSize: "1.7rem", color: ink }}>{d.name}</p>
        <Heart color={`${ink}cc`} size={12} />
        <p className="text-[0.72rem] tracking-[0.12em]" style={{ opacity: 0.8 }}>
          {d.date}
        </p>
      </div>
    </div>
  );
}

function Noche({ d }: { d: InvitationData }) {
  const gold = "#d9c7a0";
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-7 py-9 text-center"
      style={{ background: "radial-gradient(130% 90% at 50% 0%, #2a2740 0%, #141225 55%, #0d0b18 100%)", color: "#f3eee5" }}
    >
      {/* polvo de estrellas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1.4px 1.4px at 20% 30%, #fff8 40%, transparent), radial-gradient(1px 1px at 70% 20%, #fff6 40%, transparent), radial-gradient(1.6px 1.6px at 80% 60%, #fff7 40%, transparent), radial-gradient(1px 1px at 35% 75%, #fff5 40%, transparent), radial-gradient(1.2px 1.2px at 55% 50%, #fff6 40%, transparent), radial-gradient(1px 1px at 15% 85%, #fff5 40%, transparent)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <p style={{ fontFamily: SERIF, fontSize: "1.9rem", letterSpacing: "0.02em" }}>
          {d.eyebrow}
        </p>
        <Star8 color={gold} size={26} />
        <p className="text-[0.74rem] tracking-[0.12em]" style={{ color: gold }}>
          {d.date}
        </p>
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <p style={{ fontFamily: SCRIPT, fontSize: "2.6rem", lineHeight: 1, color: "#fff" }}>
          {d.headline}
        </p>
        <p className="max-w-[12rem] text-[0.7rem] leading-relaxed tracking-wide" style={{ opacity: 0.85 }}>
          {d.subline}
        </p>
        <span className="mt-1 h-px w-10" style={{ background: `${gold}99` }} />
        <Heart color={gold} size={13} />
      </div>
    </div>
  );
}

function Primavera({ d }: { d: InvitationData }) {
  const orange = "#e8963f";
  const ink = "#3a3a3a";
  const leaf = "#8aa06a";
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between px-7 py-9 text-center"
      style={{ background: "#fffdf8", color: ink }}
    >
      <p
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.5rem] uppercase tracking-[0.2em]"
        style={{ writingMode: "vertical-rl", opacity: 0.6 }}
      >
        {d.eyebrow} · {d.date}
      </p>

      <div className="flex flex-col items-center">
        <p style={{ fontFamily: SANS_BLACK, fontWeight: 800, fontSize: "2.9rem", lineHeight: 0.9, color: orange, letterSpacing: "-0.02em" }}>
          {d.headline.toUpperCase()}
        </p>
        <p style={{ fontFamily: SCRIPT, fontSize: "2rem", lineHeight: 1, marginTop: "-0.2rem", color: ink }}>
          {d.subline}
        </p>
      </div>

      <div className="flex items-end justify-center gap-1">
        <Flower petal={orange} leaf={leaf} />
        <Heart color={orange} size={14} />
        <Flower petal={orange} leaf={leaf} />
      </div>

      <p style={{ fontFamily: SCRIPT, fontSize: "1.5rem", color: ink }}>{d.name}</p>
    </div>
  );
}

function Gotica({ d }: { d: InvitationData }) {
  const rose = "#b65c5c";
  const bronze = "#9c7b5a";
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between px-7 py-8 text-center"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #241c22 0%, #130d12 70%)", color: "#e9d9cf" }}
    >
      {/* marco */}
      <div
        className="pointer-events-none absolute inset-3 rounded-sm"
        style={{ border: `1px solid ${bronze}66`, boxShadow: `inset 0 0 0 3px ${bronze}22` }}
      />
      <div className="pointer-events-none absolute left-2 top-2">
        <CornerFlourish color={bronze} />
      </div>
      <div className="pointer-events-none absolute right-2 top-2">
        <CornerFlourish color={bronze} flip />
      </div>

      <div className="relative mt-2 flex flex-col items-center gap-1.5">
        <span style={{ color: `${rose}cc`, fontSize: "1rem" }}>✝</span>
        <p style={{ fontFamily: BLACK, fontSize: "2.5rem", lineHeight: 1, color: rose }}>
          {d.headline}
        </p>
        <Heart color={rose} size={12} />
      </div>

      <p
        className="relative max-w-[11rem] text-[0.82rem] leading-snug"
        style={{ fontFamily: SERIF, fontStyle: "italic", color: "#d9c3b6" }}
      >
        {d.subline}
      </p>

      <div className="relative mb-2 flex flex-col items-center gap-1">
        <p className="text-[0.78rem] uppercase tracking-[0.35em]" style={{ color: rose }}>
          {d.name}
        </p>
        <span className="h-px w-12" style={{ background: `${bronze}aa` }} />
        <p className="text-[0.62rem] tracking-[0.2em]" style={{ opacity: 0.7 }}>
          {d.date}
        </p>
      </div>
    </div>
  );
}

// Fuente bold para la primavera (usa la sans del sistema de la marca).
const SANS_BLACK = "var(--font-sans), system-ui, sans-serif";

export function InvitationTemplate({
  id,
  data,
}: {
  id: TemplateId;
  data: InvitationData;
}) {
  switch (id) {
    case "noche":
      return <Noche d={data} />;
    case "primavera":
      return <Primavera d={data} />;
    case "gotica":
      return <Gotica d={data} />;
    case "clasica":
    default:
      return <Clasica d={data} />;
  }
}
