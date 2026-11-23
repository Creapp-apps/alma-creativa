"use client";

import { useEffect, useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = { id: string; node: React.ReactNode };

export function ReorderList({
  rows,
  onReorder,
}: {
  rows: Row[];
  onReorder: (ids: string[]) => Promise<void>;
}) {
  const [order, setOrder] = useState<Row[]>(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Si cambian los datos del server (p. ej. tras alta/baja), resync.
  useEffect(() => {
    setOrder(rows);
  }, [rows]);

  function move(fromId: string, toId: string) {
    if (fromId === toId) return;
    setOrder((cur) => {
      const from = cur.findIndex((r) => r.id === fromId);
      const to = cur.findIndex((r) => r.id === toId);
      if (from < 0 || to < 0) return cur;
      const next = [...cur];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      startTransition(async () => {
        try {
          await onReorder(next.map((r) => r.id));
          toast.success("Orden actualizado");
        } catch {
          toast.error("No se pudo reordenar");
        }
      });
      return next;
    });
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {order.map((r) => (
        <div
          key={r.id}
          draggable
          onDragStart={() => setDragId(r.id)}
          onDragEnter={() => setOverId(r.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragId) move(dragId, r.id);
            setDragId(null);
            setOverId(null);
          }}
          onDragEnd={() => {
            setDragId(null);
            setOverId(null);
          }}
          className={cn(
            "flex items-center gap-1 transition-colors",
            dragId === r.id && "opacity-40",
            overId === r.id && dragId !== r.id && "bg-accent",
          )}
        >
          <span
            className="flex cursor-grab items-center self-stretch px-2 text-muted-foreground active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="size-4" />
          </span>
          <div className="min-w-0 flex-1">{r.node}</div>
        </div>
      ))}
    </div>
  );
}
