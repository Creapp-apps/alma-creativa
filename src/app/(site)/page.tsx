import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeroStudio } from "@/components/hero-studio";
import { CategoriesCarousel } from "@/components/categories-carousel";
import { DestacadosExperiencias } from "@/components/destacados-experiencias";
import { WhatsappButton } from "@/components/whatsapp-button";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { Typewriter } from "@/components/typewriter";
import { ComoPedir } from "@/components/como-pedir";
import { getCategories } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content.server";

export default async function Home() {
  const [categories, content] = await Promise.all([
    getCategories(),
    getSiteContent(),
  ]);

  const { hero, brand, categorias, destacados, proceso, ctaFinal } = content;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-20">
          <RevealGroup immediate className="max-w-xl">
            <RevealItem
              as="p"
              from="left"
              className="flex items-center gap-2 text-sm text-gold"
            >
              <span className="h-px w-6 bg-gold" />
              {hero.eyebrow} · {brand.city}
            </RevealItem>
            <RevealItem
              as="h1"
              from="fade"
              className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
            >
              {hero.titleLead}{" "}
              <em className="text-gold">{hero.titleAccent}</em>
            </RevealItem>
            <Typewriter
              as="p"
              text={hero.body}
              startDelay={520}
              className="mt-6 text-lg text-muted-foreground"
            />
            <RevealItem
              as="div"
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <WhatsappButton
                size="lg"
                label={hero.ctaPrimary}
                message="Hola Alma Creativa, quiero un presupuesto para mi evento."
              />
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/catalogo" />}
              >
                {hero.ctaSecondary}
                <ArrowRight className="size-4" />
              </Button>
            </RevealItem>
          </RevealGroup>

          <Reveal immediate delay={0.25} y={32}>
            {hero.media.url ? (
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-[0_30px_70px_-30px_rgba(33,30,38,0.45)]">
                <Image
                  src={hero.media.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  priority
                  className="object-cover"
                  style={{ objectPosition: hero.media.focal }}
                />
              </div>
            ) : (
              <HeroStudio />
            )}
          </Reveal>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <RevealGroup className="max-w-2xl">
            <RevealItem
              as="h2"
              from="fade"
              className="font-display text-3xl md:text-4xl"
            >
              {categorias.title}
            </RevealItem>
            <Typewriter
              as="p"
              text={categorias.subtitle}
              className="mt-3 text-muted-foreground"
            />
          </RevealGroup>

          <Reveal className="mt-6" y={32}>
            <CategoriesCarousel categories={categories} />
            <p className="animate-breathe mt-2 text-center text-sm text-muted-foreground">
              Arrastrá el anillo · tocá una categoría para verla
            </p>
          </Reveal>
        </div>
      </section>

      {/* CÓMO PEDIR (proceso) — antes de Destacados para darle protagonismo */}
      <section id="proceso" className="border-t border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <RevealGroup className="max-w-2xl">
            <RevealItem
              as="h2"
              from="fade"
              className="font-display text-3xl md:text-4xl"
            >
              {proceso.title}
            </RevealItem>
            <Typewriter
              as="p"
              text={proceso.subtitle}
              className="mt-3 text-muted-foreground"
            />
          </RevealGroup>

          <ComoPedir steps={proceso.steps} />
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <RevealGroup className="max-w-2xl">
              <RevealItem
                as="h2"
                from="fade"
                className="font-display text-3xl md:text-4xl"
              >
                {destacados.title}
              </RevealItem>
              <Typewriter
                as="p"
                text={destacados.subtitle}
                className="mt-3 text-muted-foreground"
              />
            </RevealGroup>
            <Reveal
              as="div"
              delay={0.1}
            >
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-foreground"
              >
                Ver todo el catálogo
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>

          <Reveal className="mt-10" y={32}>
            <DestacadosExperiencias />
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center">
          <RevealGroup>
            <RevealItem
              as="h2"
              from="fade"
              className="mx-auto max-w-2xl font-display text-3xl leading-tight md:text-4xl"
            >
              {ctaFinal.title}
            </RevealItem>
            <Typewriter
              as="p"
              text={ctaFinal.subtitle}
              className="mx-auto mt-4 max-w-xl text-primary-foreground/70"
            />
            <RevealItem
              as="div"
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/cotizador" />}
              >
                <Calculator className="size-4" />
                Armá tu pedido online
              </Button>
              <WhatsappButton
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                label="Escribinos por WhatsApp"
                message="Hola Alma Creativa, quiero empezar a organizar la papelería de mi evento."
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
