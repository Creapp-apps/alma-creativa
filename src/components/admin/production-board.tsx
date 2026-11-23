"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Calendar, Users, GripVertical, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  PRODUCTION_STAGES,
  STAGE_LABEL,
  type ProductionStage,
} from "@/lib/production-stages";
import { updateProductionStage } from "@/app/admin/actions";

export type KanbanCard = {
  id: string;
  name: string;
  stage: string;
  source: string;
  event: string | null;
  eventDate: string | null;
  guests: number | null;
  items: { name: string; qty: number }[];
};

const COLUMN_ACCENT: Record<ProductionStage, string> = {
  pendiente: "bg-muted-foreground/40",
  en_produccion: "bg-gold",
  listo: "bg-blue-500",
  entregado: "bg-green-500",
};

function asStage(v: string): ProductionStage {
  return (PRODUCTION_STAGES as readonly string[]).includes(v)
    ? (v as ProductionStage)
    : "pendiente";
}

export function ProductionBoard({ cards }: { cards: KanbanCard[] }) {
  // Override optimista id -> stage (se superpone a lo que llega del server).
  const [moved, setMoved] = useState<Record<string, ProductionStage>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<ProductionStage | null>(null);
  const [, start] = useTransition();

  const stageOf = (c: KanbanCard) => moved[c.id] ?? asStage(c.stage);

  const byStage = useMemo(() => {
    const map: Record<ProductionStage, KanbanCard[]> = {
      pendiente: [],
      en_produccion: [],
      listo: [],
      entregado: [],
    };
    for (const c of cards) map[stageOf(c)].push(c);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, moved]);

  function move(id: string, to: ProductionStage, current: ProductionStage) {
    if (to === current) return;
    setMoved((m) => ({ ...m, [id]: to }));
    start(async () => {
      await updateProductionStage(id, to);
      toast.success(`Movido a ${STAGE_LABEL[to]}`);
    });
  }

  function onDrop(to: ProductionStage) {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const card = cards.find((c) => c.id === id);
    if (card) move(id, to, stageOf(card));
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Tablero</h1>
        <p className="text-sm text-muted-foreground">
          Producción por etapas · arrastrá las tarjetas entre columnas
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCTION_STAGES.map((stage) => {
          const list = byStage[stage];
          return (
            <section
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(stage);
              }}
              onDragLeave={() => setOverCol((c) => (c === stage ? null : c))}
              onDrop={() => onDrop(stage)}
              className={cn(
                "flex min-h-40 flex-col rounded-xl border border-border bg-card/40 transition-colors",
                overCol === stage && "border-gold bg-gold-soft/40",
              )}
            >
              <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    COLUMN_ACCENT[stage],
                  )}
                />
                <h2 className="text-sm font-medium">{STAGE_LABEL[stage]}</h2>
                <span className="ml-auto rounded-md bg-secondary px-1.5 text-xs tabular-nums text-muted-foreground">
                  {list.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {list.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    Vacío
                  </p>
                ) : (
                  list.map((card) => (
                    <KanbanItem
                      key={card.id}
                      card={card}
                      stage={stage}
                      dragging={dragId === card.id}
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      onMove={(to) => move(card.id, to, stage)}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function KanbanItem({
  card,
  stage,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  card: KanbanCard;
  stage: ProductionStage;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (to: ProductionStage) => void;
}) {
  const totalItems = card.items.reduce((n, it) => n + it.qty, 0);
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm active:cursor-grabbing",
        dragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-sm">{card.name}</h3>
            {card.source !== "web" ? (
              <span className="shrink-0 rounded bg-secondary px-1 text-[10px] uppercase text-muted-foreground">
                lead
              </span>
            ) : null}
          </div>
          {card.event ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {card.event}
              {card.eventDate ? ` · ${card.eventDate}` : ""}
            </p>
          ) : null}
          {card.guests ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              {card.guests} inv.
            </p>
          ) : null}
          {totalItems > 0 ? (
            <p className="mt-1 truncate text-xs text-foreground/80">
              {card.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}
            </p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Mover"
                className="opacity-0 transition-opacity group-hover:opacity-100 data-[popup-open]:opacity-100"
              >
                <ChevronRight className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            {PRODUCTION_STAGES.filter((s) => s !== stage).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onMove(s)}>
                {STAGE_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
