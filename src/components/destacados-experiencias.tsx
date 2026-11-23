"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import TearTicket from "@/components/tear-ticket";
import { ScratchCard } from "@/components/scratch-card";
import { ChocoUnwrap } from "@/components/choco-unwrap";
import { EnvelopeOpen } from "@/components/envelope-open";

/* =========================================================================
   DESTACADOS — 4 experiencias interactivas fijas (curadas por Alma).
   ========================================================================= */

function Tile({
  title,
  desc,
  href,
  children,
}: {
  title: string;
  desc: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex min-h-[230px] flex-1 items-center justify-center bg-secondary/30 px-4 py-6">
        {children}
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-border p-4">
        <div>
          <h3 className="font-display text-lg leading-snug">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        <Link
          href={href}
          aria-label={`Ver ${title}`}
          className="mt-1 shrink-0 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function DestacadosExperiencias() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* 1 · Ticket troquelado */}
      <Tile
        title="Ticket troquelado"
        desc="Entradas y tarjetas con talón que se arranca."
        href="/catalogo"
      >
        <TearTicket
          width={360}
          height={158}
          stubSize={100}
          background="#f4ecda"
          color="#4a360f"
          borderColor="rgba(138,110,53,0.4)"
          rotate={-3}
          stub={
            <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
              <span className="text-[0.55rem] uppercase tracking-[0.22em] opacity-70">
                Admite
              </span>
              <span className="font-display text-2xl">1</span>
              <span className="text-[0.5rem] tracking-[0.12em] opacity-60">
                Nº 284619
              </span>
            </div>
          }
        >
          <div className="flex h-full flex-col justify-center px-5">
            <span className="text-[0.55rem] uppercase tracking-[0.28em] opacity-60">
              Alma Creativa · Eventos
            </span>
            <span className="mt-1 font-display text-xl italic">Noche de gala</span>
            <span className="mt-1 text-xs opacity-70">
              Salón Costanera · 29.08.2026
            </span>
          </div>
        </TearTicket>
      </Tile>

      {/* 2 · Raspadita */}
      <Tile
        title="Raspadita"
        desc="Sorteos y dinámicas: rascá y revelá el premio."
        href="/catalogo"
      >
        <div className="h-[160px] w-full max-w-[260px]">
          <ScratchCard label="RASPÁ" hint="con el dedo">
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-card text-center">
              <Sparkles className="size-6 text-gold" strokeWidth={1.4} />
              <p className="font-display text-2xl italic">¡Ganaste!</p>
              <p className="text-sm text-muted-foreground">Barra libre: 1 trago</p>
            </div>
          </ScratchCard>
        </div>
      </Tile>

      {/* 3 · Chocolates personalizados */}
      <Tile
        title="Chocolates personalizados"
        desc="Envoltorios impresos; desenvolvé y mirá el nombre."
        href="/catalogo"
      >
        <div className="mx-auto w-full max-w-[158px]">
          <ChocoUnwrap name="Para Emi" />
        </div>
      </Tile>

      {/* 4 · Invitaciones clásicas */}
      <Tile
        title="Invitaciones clásicas"
        desc="Un sobre que se abre y revela tu invitación."
        href="/catalogo"
      >
        <EnvelopeOpen />
      </Tile>
    </div>
  );
}
