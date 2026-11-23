"use client";

import { useRouter } from "next/navigation";
import CircularCarousel from "@/components/circular-carousel";
import { getIcon } from "@/lib/icons";

type Cat = {
  slug: string;
  name: string;
  short: string;
  icon: string;
  tint: string;
};

function Panel({ cat }: { cat: Cat }) {
  const Icon = getIcon(cat.icon);
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="relative flex flex-1 items-center justify-center"
        style={{ backgroundColor: cat.tint }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-50 mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 45%), radial-gradient(circle at 80% 85%, rgba(0,0,0,0.05), transparent 40%)",
          }}
        />
        <Icon aria-hidden className="size-14 text-foreground/55" strokeWidth={1.2} />
      </div>
      <div className="bg-card px-4 py-3 text-center">
        <p className="font-display text-base leading-snug">{cat.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {cat.short}
        </p>
      </div>
    </div>
  );
}

export function CategoriesCarousel({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const items = categories.map((cat) => ({
    slug: cat.slug,
    title: cat.name,
    subtitle: cat.short,
    alt: cat.name,
    node: <Panel cat={cat} />,
  }));

  return (
    <div className="relative h-[440px] w-full md:h-[520px]">
      <CircularCarousel
        items={items}
        preset="orbit"
        intro="assemble"
        cardWidth={230}
        aspectRatio={0.77}
        gap={28}
        speed={9}
        parallax={0.35}
        depthFade={0.4}
        fadeColor="#f4efe6"
        cornerRadius={16}
        captions
        onItemClick={(item: { slug: string }) =>
          router.push(`/catalogo?categoria=${item.slug}`)
        }
      />
    </div>
  );
}
