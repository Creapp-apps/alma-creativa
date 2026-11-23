"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES } from "@/lib/leads-status";

const tone: Record<string, string> = {
  nuevo: "bg-gold-soft text-gold border-gold/30",
  contactado: "bg-secondary text-foreground border-border",
  presupuestado: "bg-secondary text-foreground border-border",
  ganado: "bg-emerald-100 text-emerald-800 border-emerald-300",
  perdido: "bg-muted text-muted-foreground border-border",
};

export function LeadStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(next) => {
        if (!next) return;
        setValue(next);
        startTransition(async () => {
          await updateLeadStatus(id, next);
          toast.success("Estado actualizado");
        });
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "rounded-full capitalize transition-colors",
          tone[value] ?? "bg-secondary text-foreground border-border",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
