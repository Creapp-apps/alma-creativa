import { Suspense } from "react";
import type { Metadata } from "next";
import { Cotizador } from "@/components/cotizador";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { Typewriter } from "@/components/typewriter";
import { getCategories, getEvents, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cotizador",
  description:
    "Armá tu pedido de papelería en 3 pasos y pedí tu presupuesto a medida.",
};

type SearchParams = Promise<{ evento?: string; producto?: string }>;

async function CotizadorLoader({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const [categories, events, products] = await Promise.all([
    getCategories(),
    getEvents(),
    getProducts(),
  ]);

  const initialEvent = events.some((e) => e.slug === sp.evento)
    ? sp.evento
    : undefined;
  const initialProduct = products.some((p) => p.slug === sp.producto)
    ? sp.producto
    : undefined;

  return (
    <Cotizador
      categories={categories}
      events={events}
      products={products}
      initialEvent={initialEvent}
      initialProduct={initialProduct}
    />
  );
}

export default function CotizadorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-14 md:py-20">
      <RevealGroup as="header" immediate className="max-w-2xl">
        <RevealItem
          as="p"
          from="left"
          className="flex items-center gap-2 text-sm text-gold"
        >
          <span className="h-px w-6 bg-gold" />
          Cotizador
        </RevealItem>
        <RevealItem
          as="h1"
          from="fade"
          className="mt-4 font-display text-4xl md:text-5xl"
        >
          Armá tu pedido
        </RevealItem>
        <Typewriter
          as="p"
          text="Contanos tu evento y elegí lo que necesitás. Te preparamos un presupuesto a medida, sin compromiso."
          startDelay={420}
          className="mt-4 text-lg text-muted-foreground"
        />
      </RevealGroup>

      <div className="mt-12">
        <Suspense fallback={<div className="h-72" />}>
          <CotizadorLoader searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
