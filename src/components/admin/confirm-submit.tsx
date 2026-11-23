"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Botón de submit con confirmación en modal (para formularios de baja).
// Se usa DENTRO de un <form action={serverAction}>.
export function ConfirmSubmit({
  label,
  title = "¿Eliminar?",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
}: {
  label: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  function confirm() {
    const form = ref.current?.closest("form");
    setOpen(false);
    form?.requestSubmit();
  }

  return (
    <span ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        {label}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-foreground/40 animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-display text-lg">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" size="sm" onClick={confirm}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}
