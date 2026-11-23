"use client";

import { Sparkles, QrCode } from "lucide-react";
import { InvitationTemplate } from "@/components/invitation-templates";
import { MesaCard, PALETTES, TYPE_STYLES, TABLE_THEMES } from "@/components/invitation-preview";
import type { Product } from "@/lib/data";

/* =========================================================================
   ORDER STUDIO — mockup DECORATIVO del producto. No es un editor de
   personalización: se va completando solo con los datos del pedido (nombre,
   evento, fecha) que el cliente carga para avanzar. Es un adorno animado.
   La personalización real se define después, hablando con el cliente.
   ========================================================================= */

const GOLD = "#8a6e35";

export function fmtDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

function Portrait({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-34px_rgba(33,30,38,0.6)]">
      {children}
    </div>
  );
}

/* ---------- Mockups ---------- */

function ChocolateMock({ nombre, tematica }: { nombre: string; tematica: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 p-6">
      <div
        className="relative aspect-[3/4] w-full max-w-[150px] overflow-hidden rounded-xl"
        style={{
          background: "linear-gradient(145deg, #4a2c1a 0%, #3a2114 55%, #2c190f 100%)",
          boxShadow: "inset 0 2px 6px rgba(255,255,255,0.12), inset 0 -8px 20px rgba(0,0,0,0.45)",
        }}
      >
        <div className="grid h-full w-full grid-cols-3 grid-rows-4 gap-[3px] p-[3px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-[3px]" style={{ background: "linear-gradient(145deg,#5a3522,#39200f)", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <p className="font-display text-lg italic" style={{ color: "#e9d3bf" }}>{nombre}</p>
          <span className="mt-1 h-px w-8" style={{ background: "#e9d3bf66" }} />
          <p className="mt-1 text-[0.5rem] uppercase tracking-[0.2em]" style={{ color: "#e9d3bf99" }}>{tematica}</p>
        </div>
      </div>
    </div>
  );
}

function RaspaditaMock({ detalle }: { detalle: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 p-6">
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 text-center" style={{ borderColor: "rgba(138,110,53,0.5)", background: "linear-gradient(135deg,#fff,#fbf5e8)" }}>
        <Sparkles className="size-6 text-gold" strokeWidth={1.4} />
        <p className="font-display text-2xl italic text-foreground">¡Rascá y ganá!</p>
        <p className="text-sm text-muted-foreground">{detalle}</p>
        <p className="mt-1 text-[0.55rem] uppercase tracking-[0.25em] text-gold">Raspadita · Alma Creativa</p>
      </div>
    </div>
  );
}

function MaskMock({ nombre }: { nombre: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-secondary/40 p-6">
      <svg width="180" height="110" viewBox="0 0 180 110" aria-hidden>
        <path d="M10 30 C 30 8, 70 8, 90 26 C 110 8, 150 8, 170 30 C 176 56, 150 96, 112 90 C 98 88, 92 78, 90 72 C 88 78, 82 88, 68 90 C 30 96, 4 56, 10 30 Z" fill={GOLD} opacity="0.92" />
        <ellipse cx="52" cy="46" rx="18" ry="11" fill="#fbf7ef" />
        <ellipse cx="128" cy="46" rx="18" ry="11" fill="#fbf7ef" />
        <path d="M150 26 C 170 6, 184 10, 178 30" stroke={GOLD} strokeWidth="3" fill="none" />
        <path d="M30 26 C 10 6, -4 10, 2 30" stroke={GOLD} strokeWidth="3" fill="none" />
      </svg>
      <div className="text-center">
        <p className="font-display text-lg">{nombre}</p>
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">Careta · props</p>
      </div>
    </div>
  );
}

function WristbandMock({ evento, nombre }: { evento: string; nombre: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 p-6">
      <div className="flex w-full max-w-[300px] items-center gap-3 rounded-full px-4 py-3 text-left" style={{ background: GOLD, color: "#fff" }}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/90 text-foreground">
          <QrCode className="size-8" strokeWidth={1.4} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-tight">{evento}</p>
          <p className="truncate text-xs opacity-80">{nombre}</p>
          <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.2em] opacity-70">Pulsera QR</p>
        </div>
      </div>
    </div>
  );
}

function TrophyMock({ nombre, leyenda, date }: { nombre: string; leyenda: string; date: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary/40 p-6">
      <svg width="96" height="110" viewBox="0 0 96 110" aria-hidden>
        <defs>
          <linearGradient id="trophyg" x1="0" x2="1">
            <stop offset="0" stopColor="#c9a24a" />
            <stop offset="0.5" stopColor="#8a6e35" />
            <stop offset="1" stopColor="#c9a24a" />
          </linearGradient>
        </defs>
        <path d="M28 10 H68 V34 C68 52 58 60 48 60 C38 60 28 52 28 34 Z" fill="url(#trophyg)" />
        <path d="M28 16 C 12 16 12 38 30 40" stroke="#8a6e35" strokeWidth="4" fill="none" />
        <path d="M68 16 C 84 16 84 38 66 40" stroke="#8a6e35" strokeWidth="4" fill="none" />
        <rect x="43" y="60" width="10" height="14" fill="#8a6e35" />
        <rect x="30" y="74" width="36" height="8" rx="2" fill="url(#trophyg)" />
        <rect x="26" y="82" width="44" height="10" rx="2" fill="#6b5327" />
      </svg>
      <div className="text-center">
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-gold">{leyenda}</p>
        <p className="font-display text-xl">{nombre}</p>
        {date ? <p className="text-xs text-muted-foreground">{date}</p> : null}
      </div>
    </div>
  );
}

function SouvenirMock({ nombre, date }: { nombre: string; date: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary/40 p-6">
      <div className="relative w-full max-w-[180px]">
        <div className="mx-auto mb-[-6px] h-10 w-px bg-gold/50" />
        <div className="relative rounded-xl border px-5 py-7 text-center" style={{ background: "linear-gradient(160deg,#fff,#f6efe1)", borderColor: "rgba(138,110,53,0.35)" }}>
          <span className="absolute left-1/2 top-3 size-3 -translate-x-1/2 rounded-full border border-gold/50 bg-secondary" />
          <p className="mt-3 font-display text-lg italic text-foreground">¡Gracias por venir!</p>
          <span className="mx-auto mt-2 block h-px w-8 bg-gold/50" />
          <p className="mt-2 text-sm">{nombre}</p>
          {date ? <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{date}</p> : null}
        </div>
      </div>
    </div>
  );
}

function GenericMock({ product, date }: { product: Product; date: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary/40 p-8 text-center">
      <span className="h-px w-10 bg-gold/60" />
      <Sparkles className="size-6 text-gold" strokeWidth={1.4} />
      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">Alma Creativa</p>
      <p className="font-display text-xl leading-snug">{product.name}</p>
      <p className="max-w-[16rem] text-sm text-muted-foreground">{product.blurb}</p>
      {date ? <p className="text-xs text-gold">{date}</p> : null}
      <span className="h-px w-10 bg-gold/60" />
    </div>
  );
}

/* ---------- Dispatcher: el mockup se arma con los datos del pedido ---------- */

export function ProductMockup({
  iconName,
  name,
  eventName,
  date,
  product,
}: {
  iconName: string;
  name: string; // nombre que carga el cliente
  eventName: string; // tipo de evento (si eligió)
  date: string; // fecha formateada
  product: Product;
}) {
  const who = name.trim() || eventName || "Tu evento";
  switch (iconName) {
    case "Mail":
      return (
        <Portrait>
          <InvitationTemplate
            id="clasica"
            data={{
              eyebrow: eventName || "Estás invitada",
              headline: "Gracias",
              subline: "por acompañarnos",
              name: name.trim() || "Alma Creativa",
              date,
            }}
          />
        </Portrait>
      );
    case "Hash":
      return (
        <Portrait>
          <MesaCard
            palette={PALETTES[0]}
            number="1"
            theme={{ ...TABLE_THEMES[0], name: eventName || who }}
            typeStyle={TYPE_STYLES[1]}
            animate={false}
          />
        </Portrait>
      );
    case "Candy":
      return <ChocolateMock nombre={name.trim() || "Para vos"} tematica={eventName || "Alma Creativa"} />;
    case "Ticket":
      return <RaspaditaMock detalle={eventName ? `En ${eventName}` : "Tu premio en la fiesta"} />;
    case "VenetianMask":
      return <MaskMock nombre={who} />;
    case "QrCode":
      return <WristbandMock evento={eventName || who} nombre={name.trim() || "Acceso · galería · playlist"} />;
    case "Trophy":
      return <TrophyMock nombre={name.trim() || "Nombre"} leyenda={eventName || "Reconocimiento"} date={date} />;
    case "Gift":
      return <SouvenirMock nombre={eventName || who} date={date} />;
    default:
      return <GenericMock product={product} date={date} />;
  }
}
