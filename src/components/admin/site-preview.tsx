"use client";

import { Sparkles, MessageCircle, AtSign } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";
import type { Category, EventType, Product } from "@/lib/data";
import { getIcon } from "@/lib/icons";

export type PreviewTab =
  | "hero"
  | "categorias"
  | "destacados"
  | "eventos"
  | "proceso"
  | "cierre"
  | "marca";

// Ventana de vista previa en vivo de la sección que se está editando.
export function SitePreview({
  content,
  categories,
  events,
  products,
  tab,
}: {
  content: SiteContent;
  categories: Category[];
  events: EventType[];
  products: Product[];
  tab: PreviewTab;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
        <span className="size-2.5 rounded-full bg-destructive/50" />
        <span className="size-2.5 rounded-full bg-gold/50" />
        <span className="size-2.5 rounded-full bg-emerald-400/50" />
        <span className="ml-2 truncate rounded-full bg-background px-2 py-0.5 text-[0.65rem] text-muted-foreground">
          almacreativa.com.ar
        </span>
      </div>

      <div className="max-h-[70vh] overflow-auto p-5 text-foreground">
        {tab === "hero" && <HeroPreview content={content} />}
        {tab === "categorias" && (
          <SectionWithTiles
            title={content.categorias.title}
            subtitle={content.categorias.subtitle}
            categories={categories}
          />
        )}
        {tab === "destacados" && (
          <DestacadosPreview content={content} products={products} />
        )}
        {tab === "eventos" && (
          <EventosPreview content={content} events={events} />
        )}
        {tab === "proceso" && <ProcesoPreview content={content} />}
        {tab === "cierre" && <CierrePreview content={content} />}
        {tab === "marca" && <MarcaPreview content={content} />}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  big,
}: {
  title: string;
  subtitle: string;
  big?: boolean;
}) {
  return (
    <div>
      <h2 className={big ? "font-display text-xl" : "font-display text-lg"}>
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function CatTile({ cat }: { cat: Category }) {
  const Icon = getIcon(cat.icon);
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="flex aspect-[4/3] items-center justify-center"
        style={
          cat.imageUrl
            ? {
                backgroundImage: `url("${cat.imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: cat.focal,
              }
            : { backgroundColor: cat.tint }
        }
      >
        {!cat.imageUrl ? (
          <Icon className="size-5 text-foreground/50" strokeWidth={1.3} />
        ) : null}
      </div>
      <p className="truncate px-2 py-1.5 text-xs">{cat.name}</p>
    </div>
  );
}

function SectionWithTiles({
  title,
  subtitle,
  categories,
}: {
  title: string;
  subtitle: string;
  categories: Category[];
}) {
  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} big />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {categories.slice(0, 6).map((c) => (
          <CatTile key={c.slug} cat={c} />
        ))}
      </div>
    </div>
  );
}

function DestacadosPreview({
  content,
  products,
}: {
  content: SiteContent;
  products: Product[];
}) {
  const feat = products.filter((p) => p.featured).slice(0, 4);
  return (
    <div>
      <SectionHeader {...content.destacados} big />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {feat.map((p) => {
          const Icon = getIcon(p.categoryIcon);
          return (
            <div
              key={p.slug}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div
                className="flex aspect-[4/3] items-center justify-center"
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
                  <Icon className="size-5 text-foreground/50" strokeWidth={1.3} />
                ) : null}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{p.name}</p>
                <p className="truncate text-[0.65rem] text-gold">
                  {p.priceNote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeroPreview({ content }: { content: SiteContent }) {
  const { hero, brand } = content;
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="flex items-center gap-2 text-xs text-gold">
          <span className="h-px w-5 bg-gold" />
          {hero.eyebrow} · {brand.city}
        </p>
        <h1 className="mt-3 font-display text-2xl leading-tight">
          {hero.titleLead} <em className="text-gold">{hero.titleAccent}</em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{hero.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">
            {hero.ctaPrimary}
          </span>
          <span className="rounded-md border border-border px-3 py-1.5 text-xs">
            {hero.ctaSecondary}
          </span>
        </div>
      </div>
      {hero.media.url ? (
        <div
          className="mx-auto aspect-square w-40 overflow-hidden rounded-xl border border-border"
          style={{
            backgroundImage: `url("${hero.media.url}")`,
            backgroundSize: "cover",
            backgroundPosition: hero.media.focal,
          }}
        />
      ) : (
        <div className="relative mx-auto flex aspect-square w-40 items-center justify-center rounded-xl border border-gold/40 bg-card">
          <div className="text-center">
            <Sparkles className="mx-auto size-5 text-gold" />
            <p className="mt-2 font-display text-lg italic leading-tight">
              {brand.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EventosPreview({
  content,
  events,
}: {
  content: SiteContent;
  events: EventType[];
}) {
  return (
    <div>
      <SectionHeader {...content.eventos} big />
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {events.slice(0, 4).map((ev) => (
          <div key={ev.slug} className="flex flex-col bg-card">
            {ev.imageUrl ? (
              <div
                className="aspect-[16/9]"
                style={{
                  backgroundImage: `url("${ev.imageUrl}")`,
                  backgroundSize: "cover",
                  backgroundPosition: ev.focal,
                }}
              />
            ) : null}
            <div className="p-3">
              <p className="font-display text-sm">{ev.name}</p>
              <p className="mt-1 text-xs text-gold">Ver ideas →</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcesoPreview({ content }: { content: SiteContent }) {
  const { proceso } = content;
  return (
    <div>
      <SectionHeader title={proceso.title} subtitle={proceso.subtitle} big />
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {proceso.steps.map((s, i) => (
          <li key={i}>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h3 className="mt-2 font-display text-sm">{s.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CierrePreview({ content }: { content: SiteContent }) {
  const { ctaFinal } = content;
  return (
    <div className="rounded-lg bg-primary px-6 py-8 text-center text-primary-foreground">
      <h2 className="mx-auto max-w-sm font-display text-xl leading-tight">
        {ctaFinal.title}
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-primary-foreground/70">
        {ctaFinal.subtitle}
      </p>
      <span className="mt-4 inline-block rounded-md bg-background px-3 py-1.5 text-xs text-foreground">
        Armá tu pedido online
      </span>
    </div>
  );
}

function MarcaPreview({ content }: { content: SiteContent }) {
  const { brand, contact } = content;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
        <span className="font-display text-base">
          {brand.name}{" "}
          <span className="text-[0.6rem] uppercase tracking-widest text-gold">
            eventos
          </span>
        </span>
        <span className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground">
          Pedir presupuesto
        </span>
      </div>
      <div className="rounded-lg bg-secondary/40 p-4 text-sm">
        <p className="font-display">{brand.name}</p>
        <p className="mt-1 text-muted-foreground">{brand.tagline}</p>
        <p className="mt-1 text-xs text-muted-foreground">{brand.city}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5" /> +{contact.whatsapp}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AtSign className="size-3.5" /> {contact.instagram}
          </span>
          <span>{contact.email}</span>
        </div>
      </div>
    </div>
  );
}
