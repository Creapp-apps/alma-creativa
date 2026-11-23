import Image from "next/image";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";

// Foto del producto si existe; si no, placeholder con ícono de categoría.
export function ProductTile({
  iconName,
  tint,
  label,
  imageUrl,
  focal,
  alt,
  className,
}: {
  iconName: string;
  tint: string;
  label?: string;
  imageUrl?: string | null;
  focal?: string;
  alt?: string;
  className?: string;
}) {
  const Icon = getIcon(iconName);
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor: tint }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt ?? label ?? ""}
          fill
          sizes="(max-width: 768px) 50vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={focal ? { objectPosition: focal } : undefined}
        />
      ) : (
        <>
          {/* trama sutil de papel */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.5] mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 45%), radial-gradient(circle at 80% 85%, rgba(0,0,0,0.05), transparent 40%)",
            }}
          />
          {/* marco dorado sutil que aparece al pasar el mouse */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 rounded-lg border border-gold/0 transition-colors duration-300 group-hover:border-gold/30"
          />
          <Icon
            aria-hidden
            className="size-12 text-foreground/55 transition-transform duration-500 group-hover:scale-110"
            strokeWidth={1.25}
          />
        </>
      )}
      {label ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[0.7rem] font-medium text-foreground/70 backdrop-blur">
          {label}
        </span>
      ) : null}
    </div>
  );
}
