"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, Mail, Hash } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  TEMPLATES,
  InvitationTemplate,
  type InvitationData,
  type TemplateId,
} from "@/components/invitation-templates";

/* =========================================================================
   MINI-ESTUDIO EN VIVO
   - Invitación: plantillas que recrean el estilo real de Alma (clásica,
     noche, primavera, gótica), con tilt 3D al mover el mouse.
   - Número de mesa: editor por presets (número, temática, paleta, letra).
   ========================================================================= */

/* ---- Tarjeta con inclinación 3D al pasar el mouse ---- */

function TiltCard({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), {
    stiffness: 150,
    damping: 15,
  });

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div style={{ perspective: 900 }} className="w-full max-w-xs">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border shadow-[0_40px_80px_-30px_rgba(33,30,38,0.6)]"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---- Presets de número de mesa ---- */

export type Palette = {
  id: string;
  label: string;
  bg: string;
  ink: string;
  accent: string;
  muted: string;
  border: string;
};

export const PALETTES: Palette[] = [
  { id: "champan", label: "Champán", bg: "#ffffff", ink: "#211e26", accent: "#8a6e35", muted: "#6b6470", border: "rgba(138,110,53,0.35)" },
  { id: "rosa", label: "Rosa polvo", bg: "#fff7f6", ink: "#5b2b33", accent: "#b76e79", muted: "#8a6a6f", border: "rgba(183,110,121,0.35)" },
  { id: "salvia", label: "Verde salvia", bg: "#f5f8f3", ink: "#2f3a2e", accent: "#6b8f5e", muted: "#5f6b5c", border: "rgba(107,143,94,0.35)" },
  { id: "noche", label: "Noche", bg: "#211e26", ink: "#f3eee5", accent: "#c7a76a", muted: "#a79fb0", border: "rgba(199,167,106,0.4)" },
];

export type TypeStyle = { id: string; label: string; className: string };
export const TYPE_STYLES: TypeStyle[] = [
  { id: "clasica", label: "Clásica", className: "font-display not-italic" },
  { id: "romantica", label: "Romántica", className: "font-display italic" },
  { id: "moderna", label: "Moderna", className: "font-sans uppercase tracking-[0.12em]" },
];

const NUMBERS = ["1", "2", "3", "5", "7", "8"];
export type TableTheme = { id: string; label: string; name: string };
export const TABLE_THEMES: TableTheme[] = [
  { id: "solo", label: "Solo número", name: "" },
  { id: "ciudades", label: "Ciudades", name: "París" },
  { id: "flores", label: "Flores", name: "Jazmín" },
  { id: "vinos", label: "Vinos", name: "Malbec" },
];

/* ---- UI ---- */

function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-gold bg-gold/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold/40",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Swatches({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {PALETTES.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={active}
            aria-label={p.label}
            title={p.label}
            className={[
              "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors",
              active ? "border-gold text-foreground" : "border-border text-muted-foreground hover:border-gold/40",
            ].join(" ")}
          >
            <span className="size-6 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Tarjeta de número de mesa (reusable: preview y fan del hero) ---- */

export function MesaCard({
  palette,
  number,
  theme,
  typeStyle,
  animate = true,
}: {
  palette: Palette;
  number: string;
  theme: TableTheme;
  typeStyle: TypeStyle;
  animate?: boolean;
}) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-5 px-7 text-center transition-colors duration-500"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <span className="h-px w-10 transition-colors duration-500" style={{ background: palette.accent }} />
      <Sparkles className="size-6 transition-colors duration-500" strokeWidth={1.4} style={{ color: palette.accent }} />
      <motion.div
        key={animate ? `mesa-${theme.id}-${typeStyle.id}` : undefined}
        initial={animate ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.3em]" style={{ color: palette.muted }}>
          Mesa
        </p>
        <p className={`text-7xl leading-none ${typeStyle.className}`} style={{ color: palette.accent }}>
          {number}
        </p>
        {theme.name ? (
          <p className={`mt-1 text-xl ${typeStyle.className}`} style={{ color: palette.ink }}>
            {theme.name}
          </p>
        ) : null}
      </motion.div>
      <span className="h-px w-10 transition-colors duration-500" style={{ background: palette.accent }} />
      <p className="text-xs transition-colors duration-500" style={{ color: palette.muted }}>
        Te esperamos en tu lugar
      </p>
    </div>
  );
}

// Muestra estática para el fan del hero (sin animación de entrada).
export function MesaSample() {
  return (
    <MesaCard
      palette={PALETTES[0]}
      number={NUMBERS[2]}
      theme={TABLE_THEMES[1]}
      typeStyle={TYPE_STYLES[1]}
      animate={false}
    />
  );
}

const TABS = [
  { id: "invitacion", label: "Invitación", icon: Mail },
  { id: "mesa", label: "Número de mesa", icon: Hash },
] as const;

export type StudioTab = (typeof TABS)[number]["id"];

export function InvitationPreview({
  initialTab = "invitacion",
  initialTemplate,
}: {
  initialTab?: StudioTab;
  initialTemplate?: TemplateId;
} = {}) {
  const [tab, setTab] = useState<StudioTab>(initialTab);

  // Invitación: plantilla real + texto editable en vivo.
  const [templateId, setTemplateId] = useState<TemplateId>(
    initialTemplate ?? TEMPLATES[0].id,
  );
  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const [data, setData] = useState<InvitationData>(template.sample);
  // Al cambiar de estilo, cargamos su muestra como punto de partida.
  useEffect(() => {
    setData(template.sample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);
  const setField = (key: keyof InvitationData) => (value: string) =>
    setData((d) => ({ ...d, [key]: value }));

  // Número de mesa: presets + texto libre.
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [typeId, setTypeId] = useState(TYPE_STYLES[0].id);
  const [mesaNumber, setMesaNumber] = useState(NUMBERS[0]);
  const [themeId, setThemeId] = useState(TABLE_THEMES[0].id);
  const palette = PALETTES.find((p) => p.id === paletteId)!;
  const typeStyle = TYPE_STYLES.find((t) => t.id === typeId)!;
  const baseTheme = TABLE_THEMES.find((t) => t.id === themeId)!;
  const [mesaName, setMesaName] = useState(baseTheme.name);
  // Al cambiar de temática, proponemos su nombre como punto de partida.
  useEffect(() => {
    setMesaName(baseTheme.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId]);
  const theme = { ...baseTheme, name: mesaName };

  const waMessage =
    tab === "invitacion"
      ? `Hola Alma Creativa, me gustó el previsualizador. Quiero una invitación estilo ${template.label} para ${data.name || "mi evento"}${data.date ? ` (${data.date})` : ""}.`
      : `Hola Alma Creativa, quiero números de mesa estilo ${baseTheme.label}, paleta ${palette.label}, letra ${typeStyle.label}.`;
  const waLabel = tab === "invitacion" ? "Quiero este estilo" : "Quiero estos números";

  return (
    <div>
      {/* Pestañas */}
      <div className="flex w-fit gap-1 rounded-full border border-border bg-card p-1">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-center gap-10 md:grid-cols-2">
        {/* CONTROLES */}
        <div className="order-2 md:order-1">
          {tab === "invitacion" ? (
            <>
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">
                  Estilo de invitación
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <Chip key={t.id} active={t.id === templateId} onClick={() => setTemplateId(t.id)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">
                  Tu texto
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="inv-headline" className="text-xs text-muted-foreground">
                        Palabra protagonista
                      </Label>
                      <Input
                        id="inv-headline"
                        value={data.headline}
                        onChange={(e) => setField("headline")(e.target.value)}
                        placeholder="Gracias"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inv-name" className="text-xs text-muted-foreground">
                        Nombre / firma
                      </Label>
                      <Input
                        id="inv-name"
                        value={data.name}
                        onChange={(e) => setField("name")(e.target.value)}
                        placeholder="Ornella"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="inv-subline" className="text-xs text-muted-foreground">
                      Subfrase
                    </Label>
                    <Input
                      id="inv-subline"
                      value={data.subline}
                      onChange={(e) => setField("subline")(e.target.value)}
                      placeholder="por celebrar conmigo"
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="inv-eyebrow" className="text-xs text-muted-foreground">
                        Frase de arriba
                      </Label>
                      <Textarea
                        id="inv-eyebrow"
                        value={data.eyebrow}
                        onChange={(e) => setField("eyebrow")(e.target.value)}
                        rows={2}
                        className="min-h-0 resize-none"
                        placeholder="Los mejores momentos merecen compartirse"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inv-date" className="text-xs text-muted-foreground">
                        Fecha
                      </Label>
                      <Input
                        id="inv-date"
                        value={data.date}
                        onChange={(e) => setField("date")(e.target.value)}
                        placeholder="29.08.2026"
                        className="w-28"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Escribí y mirá cómo cambia al instante. Movel el mouse sobre la
                tarjeta para verla en 3D.
              </p>
            </>
          ) : (
            <>
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">Número</legend>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {NUMBERS.map((n) => (
                    <Chip key={n} active={n === mesaNumber} onClick={() => setMesaNumber(n)} className="min-w-10 justify-center font-display">
                      {n}
                    </Chip>
                  ))}
                  <Input
                    aria-label="Número personalizado"
                    value={mesaNumber}
                    onChange={(e) => setMesaNumber(e.target.value.slice(0, 3))}
                    className="w-16 text-center font-display"
                    placeholder="Nº"
                  />
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">Temática</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TABLE_THEMES.map((t) => (
                    <Chip key={t.id} active={t.id === themeId} onClick={() => setThemeId(t.id)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  <Label htmlFor="mesa-name" className="text-xs text-muted-foreground">
                    Nombre de la mesa (opcional)
                  </Label>
                  <Input
                    id="mesa-name"
                    value={mesaName}
                    onChange={(e) => setMesaName(e.target.value)}
                    placeholder="París, Jazmín, Malbec…"
                  />
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">Paleta</legend>
                <Swatches value={paletteId} onChange={setPaletteId} />
              </fieldset>
              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-[0.18em] text-gold">Estilo de letra</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TYPE_STYLES.map((t) => (
                    <Chip key={t.id} active={t.id === typeId} onClick={() => setTypeId(t.id)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="mt-8">
            <WhatsappButton label={waLabel} message={waMessage} />
            <p className="mt-3 text-xs text-muted-foreground">
              Es una muestra. La tuya la diseñamos con tus datos reales.
            </p>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="order-1 flex justify-center md:order-2">
          {tab === "invitacion" ? (
            <TiltCard>
              <InvitationTemplate id={template.id} data={data} />
            </TiltCard>
          ) : (
            <TiltCard>
              <MesaCard
                palette={palette}
                number={mesaNumber}
                theme={theme}
                typeStyle={typeStyle}
              />
            </TiltCard>
          )}
        </div>
      </div>
    </div>
  );
}
