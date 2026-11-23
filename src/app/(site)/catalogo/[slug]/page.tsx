import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Check, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductTile } from "@/components/product-tile";
import { ProductCard } from "@/components/product-card";
import { WhatsappButton } from "@/components/whatsapp-button";
import {
  getProductBySlug,
  getProducts,
  getEvents,
} from "@/lib/catalog";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.blurb };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [allProducts, events] = await Promise.all([getProducts(), getEvents()]);
  const eventName = (s: string) => events.find((e) => e.slug === s)?.name ?? s;
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  const waMessage = `Hola Alma Creativa, me interesa: ${product.name}. ¿Me pasás un presupuesto?`;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10 md:py-16">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
        <div className="overflow-hidden rounded-2xl border border-border">
          <ProductTile
            iconName={product.categoryIcon}
            tint={product.categoryTint}
            imageUrl={product.imageUrl}
            focal={product.focal}
            alt={product.name}
            className="aspect-square"
          />
        </div>

        <div>
          <Link
            href={`/catalogo?categoria=${product.category}`}
            className="text-sm text-gold transition-colors hover:text-foreground"
          >
            {product.categoryName}
          </Link>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.blurb}</p>

          <ul className="mt-6 space-y-2.5">
            {product.details.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            {product.events.map((e) => (
              <Badge key={e} variant="secondary" className="font-normal">
                {eventName(e)}
              </Badge>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Inversión</p>
            <p className="mt-1 font-display text-xl text-gold">
              {product.priceNote}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada pedido es a medida. Escribinos y te armamos un presupuesto sin
              compromiso.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                render={<Link href={`/cotizador?producto=${product.slug}`} />}
              >
                <Calculator className="size-4" />
                Armar pedido online
              </Button>
              <WhatsappButton
                className="w-full sm:w-auto"
                variant="outline"
                label="Consultar por WhatsApp"
                message={waMessage}
              />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-2xl md:text-3xl">
            También te puede gustar
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
