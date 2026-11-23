import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { FormSkeleton } from "@/components/admin/skeletons";

type Params = { params: Promise<{ slug: string }> };

type Row = {
  slug: string;
  name: string;
  blurb: string;
  sort_order: number;
  image_url: string | null;
  focal: string;
};

export default function Page({ params }: Params) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: Params) {
  if (!isSupabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">Configurá Supabase.</p>;
  }
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const isNew = slug === "nuevo";
  let row: Row | null = null;
  if (!isNew) {
    const { data } = await supabase
      .from("events")
      .select("slug,name,blurb,sort_order,image_url,focal")
      .eq("slug", slug)
      .maybeSingle();
    row = (data as unknown as Row) ?? null;
    if (!row) notFound();
  }

  const initial = row
    ? {
        mode: "edit" as const,
        slug: row.slug,
        name: row.name,
        blurb: row.blurb,
        sortOrder: row.sort_order,
        imageUrl: row.image_url,
        focal: row.focal,
      }
    : {
        mode: "create" as const,
        slug: "",
        name: "",
        blurb: "",
        sortOrder: 99,
        imageUrl: null,
        focal: "50% 50%",
      };

  return (
    <>
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a eventos
      </Link>
      <h1 className="mt-4 font-display text-2xl">
        {isNew ? "Nuevo evento" : "Editar evento"}
      </h1>
      <div className="mt-8">
        <EventForm initial={initial} />
      </div>
    </>
  );
}
