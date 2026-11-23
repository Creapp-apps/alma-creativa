"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2, RotateCcw, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { SiteContent } from "@/lib/site-content";
import type { Category, EventType, Product } from "@/lib/data";
import {
  saveSiteContent,
  saveCategoryCover,
  saveEventCover,
  saveProductCover,
} from "@/app/admin/site-actions";
import { SitePreview, type PreviewTab } from "@/components/admin/site-preview";
import { CoverCropper } from "@/components/admin/cover-cropper";

type CropperTarget =
  | { kind: "cat"; slug: string }
  | { kind: "event"; slug: string }
  | { kind: "product"; slug: string }
  | { kind: "hero" };

// Orden jerárquico igual al del sitio.
const TABS: { id: PreviewTab; label: string }[] = [
  { id: "hero", label: "Inicio" },
  { id: "categorias", label: "Lo que hacemos" },
  { id: "destacados", label: "Destacados" },
  { id: "eventos", label: "Para cada celebración" },
  { id: "proceso", label: "Cómo pedir" },
  { id: "cierre", label: "Cierre" },
  { id: "marca", label: "Marca & contacto" },
];

export function SiteEditor({
  initial,
  categories: initialCategories,
  events: initialEvents,
  products: initialProducts,
}: {
  initial: SiteContent;
  categories: Category[];
  events: EventType[];
  products: Product[];
}) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [baseline, setBaseline] = useState<SiteContent>(initial);
  const [cats, setCats] = useState<Category[]>(initialCategories);
  const [evs, setEvs] = useState<EventType[]>(initialEvents);
  const [prods, setProds] = useState<Product[]>(initialProducts);
  const [tab, setTab] = useState<PreviewTab>("hero");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [cropper, setCropper] = useState<CropperTarget | null>(null);

  const dirty = JSON.stringify(content) !== JSON.stringify(baseline);

  function set<S extends keyof SiteContent>(
    section: S,
    patch: Partial<SiteContent[S]>,
  ) {
    setSaved(false);
    setContent((c) => ({ ...c, [section]: { ...c[section], ...patch } }));
  }

  function setStep(i: number, patch: { title?: string; text?: string }) {
    setSaved(false);
    setContent((c) => ({
      ...c,
      proceso: {
        ...c.proceso,
        steps: c.proceso.steps.map((s, idx) =>
          idx === i ? { ...s, ...patch } : s,
        ),
      },
    }));
  }
  function addStep() {
    setContent((c) => ({
      ...c,
      proceso: {
        ...c.proceso,
        steps: [...c.proceso.steps, { title: "Nuevo paso", text: "" }],
      },
    }));
  }
  function removeStep(i: number) {
    setContent((c) => ({
      ...c,
      proceso: {
        ...c.proceso,
        steps: c.proceso.steps.filter((_, idx) => idx !== i),
      },
    }));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveSiteContent(content);
        setBaseline(content);
        setSaved(true);
        toast.success("Contenido guardado");
      } catch {
        toast.error("No se pudo guardar. Reintentá.");
      }
    });
  }

  async function onCatSaved(slug: string, url: string | null, focal: string) {
    await saveCategoryCover(slug, url, focal);
    setCats((cs) =>
      cs.map((c) => (c.slug === slug ? { ...c, imageUrl: url, focal } : c)),
    );
    toast.success("Portada actualizada");
  }
  async function onEventSaved(slug: string, url: string | null, focal: string) {
    await saveEventCover(slug, url, focal);
    setEvs((es) =>
      es.map((e) => (e.slug === slug ? { ...e, imageUrl: url, focal } : e)),
    );
    toast.success("Portada actualizada");
  }
  async function onProductSaved(
    slug: string,
    url: string | null,
    focal: string,
  ) {
    await saveProductCover(slug, url, focal);
    setProds((ps) =>
      ps.map((p) => (p.slug === slug ? { ...p, imageUrl: url, focal } : p)),
    );
    toast.success("Portada actualizada");
  }
  function onHeroSaved(url: string | null, focal: string) {
    set("hero", { media: { url, focal } });
    toast.success("Imagen del inicio lista. Acordate de Guardar cambios.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Contenido del sitio</h1>
          <p className="text-sm text-muted-foreground">
            Editá cada sección en el mismo orden del sitio. La vista previa se
            actualiza en vivo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && !dirty ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="size-4" /> Guardado
            </span>
          ) : null}
          {dirty ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setContent(baseline);
                setSaved(false);
              }}
            >
              <RotateCcw className="size-4" />
              Descartar
            </Button>
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

      {/* Navegación de secciones (orden del sitio) */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-gold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          {tab === "hero" && (
            <>
              <F label="Antetítulo">
                <Input
                  value={content.hero.eyebrow}
                  onChange={(e) => set("hero", { eyebrow: e.target.value })}
                />
              </F>
              <div className="grid gap-5 sm:grid-cols-2">
                <F label="Título (parte 1)">
                  <Input
                    value={content.hero.titleLead}
                    onChange={(e) => set("hero", { titleLead: e.target.value })}
                  />
                </F>
                <F label="Título (acento)">
                  <Input
                    value={content.hero.titleAccent}
                    onChange={(e) =>
                      set("hero", { titleAccent: e.target.value })
                    }
                  />
                </F>
              </div>
              <F label="Bajada">
                <Textarea
                  rows={4}
                  value={content.hero.body}
                  onChange={(e) => set("hero", { body: e.target.value })}
                />
              </F>
              <div className="grid gap-5 sm:grid-cols-2">
                <F label="Botón principal">
                  <Input
                    value={content.hero.ctaPrimary}
                    onChange={(e) =>
                      set("hero", { ctaPrimary: e.target.value })
                    }
                  />
                </F>
                <F label="Botón secundario">
                  <Input
                    value={content.hero.ctaSecondary}
                    onChange={(e) =>
                      set("hero", { ctaSecondary: e.target.value })
                    }
                  />
                </F>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Imagen del inicio</p>
                <button
                  type="button"
                  onClick={() => setCropper({ kind: "hero" })}
                  className="group flex w-full max-w-xs items-center gap-4 overflow-hidden rounded-xl border border-border p-3 text-left transition-shadow hover:shadow-md"
                >
                  <div
                    className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary"
                    style={
                      content.hero.media.url
                        ? {
                            backgroundImage: `url("${content.hero.media.url}")`,
                            backgroundSize: "cover",
                            backgroundPosition: content.hero.media.focal,
                          }
                        : undefined
                    }
                  >
                    {!content.hero.media.url ? (
                      <ImageIcon
                        className="size-5 text-muted-foreground"
                        strokeWidth={1.3}
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {content.hero.media.url ? "Cambiar imagen" : "Subir imagen"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reemplaza las tarjetas del inicio por una foto.
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {tab === "categorias" && (
            <>
              <F label="Título">
                <Input
                  value={content.categorias.title}
                  onChange={(e) => set("categorias", { title: e.target.value })}
                />
              </F>
              <F label="Subtítulo">
                <Textarea
                  rows={2}
                  value={content.categorias.subtitle}
                  onChange={(e) =>
                    set("categorias", { subtitle: e.target.value })
                  }
                />
              </F>

              <div className="space-y-3">
                <p className="text-sm font-medium">Fotos de portada</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {cats.map((c) => {
                    const Icon = getIcon(c.icon);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => setCropper({ kind: "cat", slug: c.slug })}
                        className="group overflow-hidden rounded-xl border border-border text-left transition-shadow hover:shadow-md"
                      >
                        <div
                          className="relative flex aspect-[4/3] items-center justify-center"
                          style={
                            c.imageUrl
                              ? {
                                  backgroundImage: `url("${c.imageUrl}")`,
                                  backgroundSize: "cover",
                                  backgroundPosition: c.focal,
                                }
                              : { backgroundColor: c.tint }
                          }
                        >
                          {!c.imageUrl ? (
                            <Icon
                              className="size-5 text-foreground/50"
                              strokeWidth={1.3}
                            />
                          ) : null}
                          <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-opacity group-hover:bg-foreground/30 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs">
                              <ImageIcon className="size-3.5" />
                              Editar
                            </span>
                          </span>
                        </div>
                        <p className="truncate px-2 py-1.5 text-xs">{c.name}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tocá una categoría para subir o reubicar su foto de portada.
                </p>
              </div>
            </>
          )}

          {tab === "destacados" && (
            <>
              <F label="Título">
                <Input
                  value={content.destacados.title}
                  onChange={(e) => set("destacados", { title: e.target.value })}
                />
              </F>
              <F label="Subtítulo">
                <Textarea
                  rows={2}
                  value={content.destacados.subtitle}
                  onChange={(e) =>
                    set("destacados", { subtitle: e.target.value })
                  }
                />
              </F>

              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Portadas de los destacados
                </p>
                {prods.filter((p) => p.featured).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No hay productos destacados. Marcá “Destacado” en Catálogo →
                    Productos.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {prods
                      .filter((p) => p.featured)
                      .map((p) => {
                        const Icon = getIcon(p.categoryIcon);
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() =>
                              setCropper({ kind: "product", slug: p.slug })
                            }
                            className="group overflow-hidden rounded-xl border border-border text-left transition-shadow hover:shadow-md"
                          >
                            <div
                              className="relative flex aspect-[4/3] items-center justify-center"
                              style={
                                p.imageUrl
                                  ? {
                                      backgroundImage: `url("${p.imageUrl}")`,
                                      backgroundSize: "cover",
                                      backgroundPosition: p.focal,
                                    }
                                  : { backgroundColor: p.categoryTint }
                              }
                            >
                              {!p.imageUrl ? (
                                <Icon
                                  className="size-5 text-foreground/50"
                                  strokeWidth={1.3}
                                />
                              ) : null}
                              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-foreground/30 group-hover:opacity-100">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs">
                                  <ImageIcon className="size-3.5" />
                                  Editar
                                </span>
                              </span>
                            </div>
                            <p className="truncate px-2 py-1.5 text-xs">
                              {p.name}
                            </p>
                          </button>
                        );
                      })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Qué productos aparecen se define con “Destacado” en Catálogo.
                  Acá gestionás su foto.
                </p>
              </div>
            </>
          )}

          {tab === "eventos" && (
            <>
              <F label="Título">
                <Input
                  value={content.eventos.title}
                  onChange={(e) => set("eventos", { title: e.target.value })}
                />
              </F>
              <F label="Subtítulo">
                <Textarea
                  rows={2}
                  value={content.eventos.subtitle}
                  onChange={(e) => set("eventos", { subtitle: e.target.value })}
                />
              </F>

              <div className="space-y-3">
                <p className="text-sm font-medium">Fotos de portada</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {evs.map((ev) => (
                    <button
                      key={ev.slug}
                      type="button"
                      onClick={() =>
                        setCropper({ kind: "event", slug: ev.slug })
                      }
                      className="group overflow-hidden rounded-xl border border-border text-left transition-shadow hover:shadow-md"
                    >
                      <div
                        className="relative flex aspect-[16/9] items-center justify-center bg-secondary"
                        style={
                          ev.imageUrl
                            ? {
                                backgroundImage: `url("${ev.imageUrl}")`,
                                backgroundSize: "cover",
                                backgroundPosition: ev.focal,
                              }
                            : undefined
                        }
                      >
                        {!ev.imageUrl ? (
                          <ImageIcon
                            className="size-5 text-muted-foreground"
                            strokeWidth={1.3}
                          />
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-foreground/30 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs">
                            <ImageIcon className="size-3.5" />
                            Editar
                          </span>
                        </span>
                      </div>
                      <p className="truncate px-2 py-1.5 text-xs">{ev.name}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tocá un evento para subir o reubicar su foto de portada.
                </p>
              </div>
            </>
          )}

          {tab === "proceso" && (
            <>
              <F label="Título">
                <Input
                  value={content.proceso.title}
                  onChange={(e) => set("proceso", { title: e.target.value })}
                />
              </F>
              <F label="Subtítulo">
                <Input
                  value={content.proceso.subtitle}
                  onChange={(e) => set("proceso", { subtitle: e.target.value })}
                />
              </F>
              <div className="space-y-3">
                <p className="text-sm font-medium">Pasos</p>
                {content.proceso.steps.map((s, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Paso {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Quitar paso ${i + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <Input
                      value={s.title}
                      placeholder="Título del paso"
                      onChange={(e) => setStep(i, { title: e.target.value })}
                    />
                    <Textarea
                      rows={2}
                      value={s.text}
                      placeholder="Descripción"
                      onChange={(e) => setStep(i, { text: e.target.value })}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="size-4" />
                  Agregar paso
                </Button>
              </div>
            </>
          )}

          {tab === "cierre" && (
            <>
              <F label="Título">
                <Textarea
                  rows={2}
                  value={content.ctaFinal.title}
                  onChange={(e) => set("ctaFinal", { title: e.target.value })}
                />
              </F>
              <F label="Subtítulo">
                <Input
                  value={content.ctaFinal.subtitle}
                  onChange={(e) =>
                    set("ctaFinal", { subtitle: e.target.value })
                  }
                />
              </F>
            </>
          )}

          {tab === "marca" && (
            <>
              <F label="Nombre">
                <Input
                  value={content.brand.name}
                  onChange={(e) => set("brand", { name: e.target.value })}
                />
              </F>
              <F label="Frase de marca">
                <Input
                  value={content.brand.tagline}
                  onChange={(e) => set("brand", { tagline: e.target.value })}
                />
              </F>
              <F label="Ciudad">
                <Input
                  value={content.brand.city}
                  onChange={(e) => set("brand", { city: e.target.value })}
                />
              </F>
              <div className="grid gap-5 sm:grid-cols-2">
                <F label="WhatsApp (sin +, solo números)">
                  <Input
                    value={content.contact.whatsapp}
                    onChange={(e) =>
                      set("contact", { whatsapp: e.target.value })
                    }
                  />
                </F>
                <F label="Instagram (usuario)">
                  <Input
                    value={content.contact.instagram}
                    onChange={(e) =>
                      set("contact", { instagram: e.target.value })
                    }
                  />
                </F>
              </div>
              <F label="Email">
                <Input
                  value={content.contact.email}
                  onChange={(e) => set("contact", { email: e.target.value })}
                />
              </F>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Vista previa en vivo
          </p>
          <SitePreview
            content={content}
            categories={cats}
            events={evs}
            products={prods}
            tab={tab}
          />
        </div>
      </div>

      {cropper ? (
        <CropperHost
          target={cropper}
          cats={cats}
          evs={evs}
          prods={prods}
          heroMedia={content.hero.media}
          onCatSaved={onCatSaved}
          onEventSaved={onEventSaved}
          onProductSaved={onProductSaved}
          onHeroSaved={onHeroSaved}
          onClose={() => setCropper(null)}
        />
      ) : null}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      {children}
    </Label>
  );
}

function CropperHost({
  target,
  cats,
  evs,
  prods,
  heroMedia,
  onCatSaved,
  onEventSaved,
  onProductSaved,
  onHeroSaved,
  onClose,
}: {
  target: CropperTarget;
  cats: Category[];
  evs: EventType[];
  prods: Product[];
  heroMedia: { url: string | null; focal: string };
  onCatSaved: (slug: string, url: string | null, focal: string) => Promise<void>;
  onEventSaved: (
    slug: string,
    url: string | null,
    focal: string,
  ) => Promise<void>;
  onProductSaved: (
    slug: string,
    url: string | null,
    focal: string,
  ) => Promise<void>;
  onHeroSaved: (url: string | null, focal: string) => void;
  onClose: () => void;
}) {
  if (target.kind === "cat") {
    const c = cats.find((x) => x.slug === target.slug);
    if (!c) return null;
    return (
      <CoverCropper
        title={`Portada · ${c.name}`}
        pathPrefix={`categories/${c.slug}`}
        initialUrl={c.imageUrl}
        initialFocal={c.focal}
        onSave={(u, f) => onCatSaved(c.slug, u, f)}
        onClose={onClose}
      />
    );
  }
  if (target.kind === "event") {
    const e = evs.find((x) => x.slug === target.slug);
    if (!e) return null;
    return (
      <CoverCropper
        title={`Portada · ${e.name}`}
        pathPrefix={`events/${e.slug}`}
        initialUrl={e.imageUrl}
        initialFocal={e.focal}
        onSave={(u, f) => onEventSaved(e.slug, u, f)}
        onClose={onClose}
      />
    );
  }
  if (target.kind === "product") {
    const pr = prods.find((x) => x.slug === target.slug);
    if (!pr) return null;
    return (
      <CoverCropper
        title={`Portada · ${pr.name}`}
        pathPrefix={`products/${pr.slug}`}
        initialUrl={pr.imageUrl}
        initialFocal={pr.focal}
        onSave={(u, f) => onProductSaved(pr.slug, u, f)}
        onClose={onClose}
      />
    );
  }
  return (
    <CoverCropper
      title="Imagen del inicio"
      pathPrefix="hero"
      initialUrl={heroMedia.url}
      initialFocal={heroMedia.focal}
      onSave={(u, f) => onHeroSaved(u, f)}
      onClose={onClose}
    />
  );
}
