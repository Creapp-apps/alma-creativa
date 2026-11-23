"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================================
   DatePicker — calendario propio, coherente con la estética de la marca
   (crema/dorado/serif). Sin dependencias externas. Valor en ISO "yyyy-mm-dd".
   ========================================================================= */

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function toISO(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function parseISO(v?: string): Date | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtLong(v: string) {
  const d = parseISO(v);
  return d
    ? d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Elegí la fecha",
  id,
  min,
  disabled,
  className,
}: {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  id?: string;
  min?: string; // iso, mínimo seleccionable
  disabled?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const today = new Date();
  const [view, setView] = useState<Date>(
    () => selected ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const minDate = parseISO(min);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Grilla del mes (lunes a domingo, 6 semanas).
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes = 0
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const rawMonth = view.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

  function pick(d: Date) {
    onChange(toISO(d));
    setOpen(false);
  }
  const isDisabled = (d: Date) =>
    minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-base outline-none transition-colors md:text-sm",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          open && "border-ring ring-3 ring-ring/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
        <span className={cn("flex-1 truncate", !value && "text-muted-foreground")}>
          {value ? fmtLong(value) : placeholder}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Elegí una fecha"
          className="absolute left-0 top-full z-50 mt-2 w-[18rem] rounded-xl border border-border bg-card p-3 shadow-[0_24px_60px_-28px_rgba(33,30,38,0.55)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-display text-sm">{monthLabel}</span>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Semana */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          {/* Días */}
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const inMonth = d.getMonth() === view.getMonth();
              const isSel = selected && sameDay(d, selected);
              const isToday = sameDay(d, today);
              const off = isDisabled(d);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={off}
                  onClick={() => pick(d)}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg text-sm transition-colors",
                    isSel
                      ? "bg-gold text-background"
                      : inMonth
                        ? "text-foreground hover:bg-gold/10"
                        : "text-muted-foreground/50 hover:bg-gold/10",
                    isToday && !isSel && "ring-1 ring-gold/50",
                    off && "pointer-events-none opacity-30",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDisabled(today)) pick(today);
                setView(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              className="text-gold transition-colors hover:text-foreground"
            >
              Hoy
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
