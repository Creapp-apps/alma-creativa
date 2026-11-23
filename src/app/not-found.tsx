import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 text-center">
      <p className="font-display text-sm tracking-[0.3em] text-gold">404</p>
      <h1 className="mt-4 max-w-md font-display text-3xl leading-tight md:text-4xl">
        No encontramos esta página.
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Button>
        <Button variant="outline" render={<Link href="/catalogo" />}>
          Ver catálogo
        </Button>
      </div>
    </div>
  );
}
