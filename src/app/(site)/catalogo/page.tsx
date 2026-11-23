import { Suspense } from "react";
import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { Typewriter } from "@/components/typewriter";
import { getCategories, getEvents, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explorá nuestra papelería para eventos: invitaciones, números de mesa, souvenirs, chocolatitos, raspaditas, pulseras con QR y más.",
};

export default async function CatalogoPage() {
  const [categories, events, products] = await Promise.all([
    getCategories(),
    getEvents(),
    getProducts(),
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
      <RevealGroup as="header" immediate className="max-w-2xl">
        <RevealItem
          as="p"
          from="left"
          className="flex items-center gap-2 text-sm text-gold"
        >
          <span className="h-px w-6 bg-gold" />
          Catálogo
        </RevealItem>
        <RevealItem
          as="h1"
          from="fade"
          className="mt-4 font-display text-4xl md:text-5xl"
        >
          Papelería para cada momento
        </RevealItem>
        <Typewriter
          as="p"
          text="Filtrá por tipo de producto o por evento. Cada pieza se diseña a medida de tu celebración."
          startDelay={420}
          className="mt-4 text-lg text-muted-foreground"
        />
      </RevealGroup>

      <div className="mt-12">
        <Suspense fallback={<div className="h-40" />}>
          <Catalog categories={categories} events={events} products={products} />
        </Suspense>
      </div>
    </section>
  );
}
