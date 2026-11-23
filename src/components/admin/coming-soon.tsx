import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  points,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  points?: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="flex flex-col items-center gap-4 p-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display text-lg">Próximamente</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Esta sección ya tiene su lugar en el back-office. La activamos en la
            próxima etapa.
          </p>
        </div>
        {points && points.length > 0 ? (
          <ul className="mt-2 grid max-w-md gap-1.5 text-left text-sm text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                {p}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
