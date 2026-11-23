"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  appearanceVars,
  type SiteContent,
  type FontPreset,
} from "@/lib/site-content";
import { saveSiteContent } from "@/app/admin/site-actions";

const BUCKET = "product-photos";

const FONTS: { id: FontPreset; label: string; note: string }[] = [
  { id: "fraunces", label: "Fraunces + Instrument Sans", note: "Editorial (actual)" },
  { id: "outfit", label: "Outfit + Space Grotesk", note: "Moderna geométrica" },
  { id: "playfair", label: "Playfair + Inter", note: "Clásica elegante" },
];

export function AppearanceEditor({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [baseline, setBaseline] = useState<SiteContent>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const a = content.appearance;
  const dirty =
    JSON.stringify(content.appearance) !== JSON.stringify(baseline.appearance);

  function setAppearance(patch: Partial<SiteContent["appearance"]>) {
    setSaved(false);
    setContent((c) => ({ ...c, appearance: { ...c.appearance, ...patch } }));
  }
  function setColor(key: "paper" | "ink" | "gold", value: string) {
    setSaved(false);
    setContent((c) => ({
      ...c,
      appearance: {
        ...c.appearance,
        colors: { ...c.appearance.colors, [key]: value },
      },
    }));
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `branding/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data
        .publicUrl;
      setAppearance({ logoUrl: url });
    } finally {
      setUploading(false);
    }
  }

  function save() {
    startTransition(async () => {
      try {
        await saveSiteContent(content);
        setBaseline(content);
        setSaved(true);
        toast.success("Apariencia guardada");
      } catch {
        toast.error("No se pudo guardar. Reintentá.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Apariencia</h1>
          <p className="text-sm text-muted-foreground">
            Personalizá el logo, los colores y la tipografía del sitio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && !dirty ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="size-4" /> Guardado
            </span>
          ) : null}
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Controles */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/50">
                {a.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.logoUrl}
                    alt="Logo"
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Sin logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInput.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {a.logoUrl ? "Cambiar logo" : "Subir logo"}
                </Button>
                {a.logoUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAppearance({ logoUrl: null })}
                  >
                    <Trash2 className="size-4" />
                    Quitar
                  </Button>
                ) : null}
              </div>
              <input
                ref={logoInput}
                type="file"
                accept="image/*"
                hidden
                onChange={onLogo}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Si no hay logo, se muestra el nombre en texto. PNG con fondo
              transparente recomendado.
            </p>
          </div>

          {/* Colores */}
          <div className="space-y-3">
            <Label>Colores</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <ColorField
                label="Papel (fondo)"
                value={a.colors.paper}
                onChange={(v) => setColor("paper", v)}
              />
              <ColorField
                label="Tinta (texto)"
                value={a.colors.ink}
                onChange={(v) => setColor("ink", v)}
              />
              <ColorField
                label="Acento"
                value={a.colors.gold}
                onChange={(v) => setColor("gold", v)}
              />
            </div>
          </div>

          {/* Tipografía */}
          <div className="space-y-2">
            <Label>Tipografía</Label>
            <Select
              value={a.font}
              onValueChange={(v) =>
                v ? setAppearance({ font: v as FontPreset }) : null
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.label} — {f.note}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Vista previa en vivo
          </p>
          <AppearancePreview content={content} />
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border p-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 border-0 px-1 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function AppearancePreview({ content }: { content: SiteContent }) {
  const vars = appearanceVars(content.appearance) as React.CSSProperties;
  const { appearance, brand, hero } = content;

  return (
    <div
      style={vars}
      className="overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
        <span className="size-2.5 rounded-full bg-destructive/50" />
        <span className="size-2.5 rounded-full bg-gold/50" />
        <span className="size-2.5 rounded-full bg-emerald-400/50" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          {appearance.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={appearance.logoUrl}
              alt={brand.name}
              className="h-7 w-auto object-contain"
            />
          ) : (
            <span className="font-display text-lg">{brand.name}</span>
          )}
          <span className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground">
            Pedir presupuesto
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gold">{hero.eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl leading-tight">
            {hero.titleLead} <em className="text-gold">{hero.titleAccent}</em>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{hero.body}</p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
              {hero.ctaPrimary}
            </span>
            <span className="rounded-md border border-border px-3 py-1.5 text-xs">
              {hero.ctaSecondary}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {[appearance.colors.paper, appearance.colors.ink, appearance.colors.gold].map(
            (c) => (
              <span
                key={c}
                className="size-8 rounded-md border border-border"
                style={{ backgroundColor: c }}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
