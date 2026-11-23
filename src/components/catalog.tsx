"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { ProductCard } from "@/components/product-card";
import type { Category, EventType, Product } from "@/lib/data";

type CatFilter = string;
type EvFilter = string;

export function Catalog({
  categories,
  events,
  products,
}: {
  categories: Category[];
  events: EventType[];
  products: Product[];
}) {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const initialCat = (params.get("categoria") as CatFilter) ?? "todas";
  const initialEv = (params.get("evento") as EvFilter) ?? "todos";

  const [cat, setCat] = useState<CatFilter>(initialCat);
  const [ev, setEv] = useState<EvFilter>(initialEv);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "todas" || p.category === cat) &&
          (ev === "todos" || p.events.includes(ev)),
      ),
    [cat, ev, products],
  );

  return (
    <div>
      {/* Filtro por categoría */}
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-gold">
          Categoría
        </span>
        <div className="flex flex-wrap gap-2">
          <Chip active={cat === "todas"} onClick={() => setCat("todas")}>
            Todas
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.slug}
              active={cat === c.slug}
              onClick={() => setCat(c.slug)}
              iconName={c.icon}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Filtro por evento */}
      <div className="mt-6 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-gold">
          Evento
        </span>
        <div className="flex flex-wrap gap-2">
          <Chip active={ev === "todos"} onClick={() => setEv("todos")}>
            Todos
          </Chip>
          {events.map((e) => (
            <Chip
              key={e.slug}
              active={ev === e.slug}
              onClick={() => setEv(e.slug)}
            >
              {e.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <motion.p
        key={`${cat}-${ev}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
      </motion.p>

      {filtered.length > 0 ? (
        <motion.div
          layout
          className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: reduce ? 0 : 0.35,
                  delay: reduce ? 0 : Math.min(i * 0.04, 0.3),
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            No hay productos con esos filtros todavía.
          </p>
          <button
            type="button"
            onClick={() => {
              setCat("todas");
              setEv("todos");
            }}
            className="mt-3 text-sm text-gold underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  iconName,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  iconName?: string;
}) {
  const Icon = iconName ? getIcon(iconName) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-gold bg-gold/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-gold/40 hover:text-foreground",
      )}
    >
      {Icon ? (
        <Icon
          className={cn("size-3.5", active ? "text-gold" : "text-muted-foreground")}
          strokeWidth={1.6}
        />
      ) : null}
      {children}
    </button>
  );
}
