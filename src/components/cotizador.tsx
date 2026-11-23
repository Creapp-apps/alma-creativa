"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, PartyPopper, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Category, EventType, Product } from "@/lib/data";
import { showEstimate, formatArs } from "@/lib/pricing";
import { waLink, site } from "@/lib/site";
import { ProductMockup, fmtDate } from "@/components/order-studio";

type Step = 1 | 2 | 3;

export function Cotizador({
  categories,
  events,
  products,
  initialEvent,
  initialProduct,
}: {
  categories: Category[];
  events: EventType[];
  products: Product[];
  initialEvent?: string;
  initialProduct?: string;
}) {
  const initialValid =
    initialProduct && products.some((p) => p.slug === initialProduct);
  const [step, setStep] = useState<Step>(initialValid ? 2 : 1);
  const [slug, setSlug] = useState<string>(initialValid ? initialProduct! : "");

  const product = useMemo(
    () => products.find((p) => p.slug === slug) ?? null,
    [slug, products],
  );

  // Datos de contacto / evento.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [event, setEvent] = useState<string>(initialEvent ?? "");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [qty, setQty] = useState(1);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waHref, setWaHref] = useState<string>(waLink());

  function pickProduct(p: Product) {
    setSlug(p.slug);
  }

  const eventName = events.find((e) => e.slug === event)?.name ?? "";
  const emailInvalid =
    email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canContact =
    name.trim().length >= 2 && phone.trim().length >= 6 && !emailInvalid;
  const total = (product?.priceFrom ?? 0) * qty;

  function buildWaMessage() {
    const ev = events.find((e) => e.slug === event);
    const lines = [
      `Hola ${site.name}, armé mi pedido desde la web:`,
      "",
      `Producto: ${qty}× ${product?.name ?? ""}`,
      "",
      `Nombre: ${name}`,
      `Tel: ${phone}`,
      email ? `Email: ${email}` : "",
      ev ? `Evento: ${ev.name}` : "",
      date ? `Fecha: ${fmtDate(date)}` : "",
      guests ? `Invitados: ${guests}` : "",
      comments ? `\nComentarios: ${comments}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }

  async function submit() {
    if (!product) return;
    setStatus("sending");
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      event: event || undefined,
      date: date || undefined,
      guests: guests ? Number(guests) : undefined,
      items: [{ slug: product.slug, qty, name: product.name }],
      comments: comments.trim() || undefined,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad response");
      setWaHref(waLink(buildWaMessage()));
      setStatus("done");
    } catch {
      setWaHref(waLink(buildWaMessage()));
      setStatus("error");
    }
  }

  if (status === "done" || status === "error") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold">
          <PartyPopper className="size-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl">¡Recibimos tu pedido!</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Te vamos a contactar para pasarte el presupuesto a medida. Para
          agilizar, también podés mandárnoslo por WhatsApp con un toque.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button render={<Link href={waHref} target="_blank" rel="noopener noreferrer" />}>
            Enviar por WhatsApp
          </Button>
          <Button variant="outline" render={<Link href="/catalogo" />}>
            Seguir viendo el catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* PASO 1 — elegí tu producto (dropdown principal) */}
          {step === 1 && (
        <div className="mx-auto mt-12 max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[0_30px_80px_-50px_rgba(33,30,38,0.55)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-gold">Empecemos</p>
            <h2 className="mt-2 font-display text-2xl leading-tight md:text-3xl">
              Seleccioná tu producto para continuar
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada producto arma su propia experiencia de pedido, con su diseño en vivo.
            </p>

            <div className="mt-7 text-left">
              <Select
                value={slug}
                onValueChange={(v) => {
                  const p = products.find((x) => x.slug === v);
                  if (p) pickProduct(p);
                }}
              >
                <SelectTrigger className="h-12 w-full px-4 text-base">
                  {product ? (
                    <span className="truncate">{product.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Elegí tu producto…</span>
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {categories.map((cat) => {
                    const prods = products.filter((p) => p.category === cat.slug);
                    if (prods.length === 0) return null;
                    return (
                      <SelectGroup key={cat.slug}>
                        <SelectLabel>{cat.name}</SelectLabel>
                        {prods.map((p) => (
                          <SelectItem key={p.slug} value={p.slug}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {product ? (
              <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft/30 p-4 text-left">
                <p className="font-display text-base leading-snug">{product.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{product.blurb}</p>
              </div>
            ) : null}

            <Button
              size="lg"
              className="mt-7 w-full"
              disabled={!product}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* PASO 2 — armá tu pedido (con mockup vivo) */}
      {step === 2 && product && (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* FORM */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.18em] text-gold">
                Contanos de tu evento
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Con estos datos preparamos tu presupuesto. El diseño final lo
                afinamos juntos por WhatsApp.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre y apellido" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
                </Field>
                <Field label="WhatsApp / Teléfono" required>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11 2345 6789" inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="Email (opcional)">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" type="email" autoComplete="email" aria-invalid={emailInvalid} />
                  {emailInvalid ? <span className="text-xs text-destructive">Revisá el email.</span> : null}
                </Field>
                <Field label="Tipo de evento">
                  <Select value={event} onValueChange={(v) => setEvent(v ?? "")}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Elegí…" /></SelectTrigger>
                    <SelectContent>
                      {events.map((ev) => (
                        <SelectItem key={ev.slug} value={ev.slug}>{ev.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fecha del evento (opcional)">
                  <DatePicker value={date} onChange={setDate} placeholder="Elegí la fecha" />
                </Field>
                <Field label="Cantidad">
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Menos" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:border-gold/40">
                      <Minus className="size-4" />
                    </button>
                    <Input value={String(qty)} onChange={(e) => setQty(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))} inputMode="numeric" className="w-16 text-center" />
                    <button type="button" aria-label="Más" onClick={() => setQty((q) => q + 1)} className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:border-gold/40">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
                <Button disabled={!canContact} onClick={() => setStep(3)}>Ver resumen</Button>
              </div>
              {!canContact ? (
                <p className="mt-3 text-right text-xs text-muted-foreground">
                  Necesitamos tu nombre y un teléfono para contactarte.
                </p>
              ) : null}
            </div>
          </div>

          {/* MOCKUP VIVO */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-gold">
                Así se va viendo tu pedido
              </p>
              <ProductMockup iconName={product.categoryIcon} name={name} eventName={eventName} date={fmtDate(date)} product={product} />
            </div>
          </div>
        </div>
      )}

      {/* PASO 3 — resumen */}
      {step === 3 && product && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* MOCKUP final + enviar */}
          <div className="order-1">
            <ProductMockup iconName={product.categoryIcon} name={name} eventName={eventName} date={fmtDate(date)} product={product} />
          </div>

          {/* Resumen */}
          <div className="order-2">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h3 className="font-display text-xl">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{qty > 1 ? `${qty} unidades` : "1 unidad"}</p>

              {eventName || date ? (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {eventName ? (
                    <li className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                      Evento: {eventName}
                    </li>
                  ) : null}
                  {date ? (
                    <li className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-gold" />
                      Fecha: {fmtDate(date)}
                    </li>
                  ) : null}
                </ul>
              ) : null}

              <div className="mt-6">
                <Label htmlFor="comments">Comentarios (opcional)</Label>
                <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Colores, referencias, lo que se te ocurra…" className="mt-2" rows={3} />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
                {showEstimate ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.18em] text-gold">Estimación</p>
                    <p className="mt-1 font-display text-3xl text-gold">{formatArs(total)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Valor orientativo. El final se confirma según diseño, materiales y cantidades.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cada pedido es a medida. Nos mandás tu selección y te pasamos el presupuesto sin compromiso.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={submit} disabled={status === "sending" || !canContact}>
                  {status === "sending" ? (
                    <><Loader2 className="size-4 animate-spin" />Enviando…</>
                  ) : (
                    <><Check className="size-4" />Enviar pedido</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep(2)}>Seguir editando</Button>
              </div>
            </div>
          </div>
        </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Producto", "Tus datos", "Resumen"];
  return (
    <ol className="flex items-center justify-center gap-2 text-sm">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-gold text-background"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : n}
            </span>
            <span className={cn("hidden sm:inline", active ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < labels.length - 1 && <span className="mx-1 h-px w-6 bg-border sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label className="grid gap-2">
      <span className="text-sm">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
    </Label>
  );
}
