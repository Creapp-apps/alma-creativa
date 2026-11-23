"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-xl">Algo salió mal</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "Ocurrió un error inesperado."}
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Reintentar
      </Button>
    </div>
  );
}
