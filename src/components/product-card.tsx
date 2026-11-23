import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductTile } from "@/components/product-tile";
import type { Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalogo/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_22px_50px_-28px_rgba(33,30,38,0.5)]"
    >
      <ProductTile
        iconName={product.categoryIcon}
        tint={product.categoryTint}
        label={product.categoryName}
        imageUrl={product.imageUrl}
        focal={product.focal}
        alt={product.name}
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-gold">
            {product.name}
          </h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <p className="text-sm text-muted-foreground">{product.blurb}</p>
        <p className="mt-auto flex items-center gap-2 pt-2 text-sm text-gold">
          {product.priceNote}
          <span className="h-px flex-1 origin-left scale-x-0 bg-gold/40 transition-transform duration-300 group-hover:scale-x-100" />
        </p>
      </div>
    </Link>
  );
}
