"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, EventType } from "@/lib/data";
import { upsertProduct, deleteProduct } from "@/app/admin/catalogo-actions";
import { saveProductCover } from "@/app/admin/site-actions";
import { CoverCropper } from "@/components/admin/cover-cropper";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

type Initial = {
  mode: "create" | "edit";
  slug: string;
  name: string;
  category: string;
  blurb: string;
  details: string;
  priceNote: string;
  priceFrom: number;
  featured: boolean;
  active: boolean;
  events: string[];
  imageUrl: string | null;
  focal: string;
};

export function ProductForm({
  initial,
  categories,
  events,
}: {
  initial: Initial;
  categories: Category[];
  events: EventType[];
}) {
  const isEdit = initial.mode === "edit";
  const [cover, setCover] = useState<{ url: string | null; focal: string }>({
    url: initial.imageUrl,
    focal: initial.focal,
  });
  const [cropper, setCropper] = useState(false);

  return (
    <div className="grid gap-6">
      <form action={upsertProduct} className="grid gap-6">
        <input type="hidden" name="mode" value={initial.mode} />
        {isEdit ? (
          <input type="hidden" name="slug" value={initial.slug} />
        ) : null}

        <div className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
          <Field label="Nombre" required>
            <Input name="name" defaultValue={initial.name} required />
          </Field>

          {!isEdit ? (
            <Field label="Slug (opcional)">
              <Input
                name="slug"
                defaultValue={initial.slug}
                placeholder="se genera del nombre"
              />
            </Field>
          ) : (
            <Field label="Slug">
              <Input value={initial.slug} disabled />
            </Field>
          )}

          <Field label="Categoría" required>
            <Select name="category" defaultValue={initial.category}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Nota de precio">
            <Input
              name="price_note"
              defaultValue={initial.priceNote}
              placeholder="Presupuesto a medida"
            />
          </Field>

          <Field label="Precio desde (ARS, orientativo)">
            <Input
              name="price_from"
              type="number"
              min={0}
              defaultValue={initial.priceFrom}
            />
          </Field>

          <div className="flex items-end gap-8">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Switch name="featured" defaultChecked={initial.featured} />
              Destacado
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Switch name="active" defaultChecked={initial.active} />
              Activo
            </label>
          </div>

          <div className="sm:col-span-2">
            <Field label="Descripción corta">
              <Input name="blurb" defaultValue={initial.blurb} />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Detalles (uno por línea)">
              <Textarea
                name="details"
                defaultValue={initial.details}
                rows={4}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <span className="text-sm font-medium">Eventos</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {events.map((e) => (
                <label
                  key={e.slug}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    name="events"
                    value={e.slug}
                    defaultChecked={initial.events.includes(e.slug)}
                    className="size-4 accent-[var(--gold)]"
                  />
                  {e.name}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Field label="Foto del producto">
              {isEdit ? (
                <button
                  type="button"
                  onClick={() => setCropper(true)}
                  className="group flex items-center gap-4 rounded-xl border border-border p-3 text-left transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex size-16 items-center justify-center overflow-hidden rounded-lg bg-secondary"
                    style={
                      cover.url
                        ? {
                            backgroundImage: `url("${cover.url}")`,
                            backgroundSize: "cover",
                            backgroundPosition: cover.focal,
                          }
                        : undefined
                    }
                  >
                    {!cover.url ? (
                      <ImageIcon
                        className="size-5 text-muted-foreground"
                        strokeWidth={1.3}
                      />
                    ) : null}
                  </div>
                  <span className="text-sm font-medium">
                    {cover.url ? "Cambiar / reubicar foto" : "Subir foto"}
                  </span>
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Guardá el producto y después vas a poder subir y reubicar su
                  foto.
                </p>
              )}
            </Field>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>

      {isEdit ? (
        <form action={deleteProduct}>
          <input type="hidden" name="slug" value={initial.slug} />
          <ConfirmSubmit
            label="Eliminar producto"
            title="¿Eliminar producto?"
            description="Se eliminará el producto del catálogo. Esta acción no se puede deshacer."
          />
        </form>
      ) : null}

      {cropper ? (
        <CoverCropper
          title={`Portada · ${initial.name}`}
          pathPrefix={`products/${initial.slug}`}
          initialUrl={cover.url}
          initialFocal={cover.focal}
          onSave={async (url, focal) => {
            await saveProductCover(initial.slug, url, focal);
            setCover({ url, focal });
          }}
          onClose={() => setCropper(false)}
        />
      ) : null}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label className="grid gap-2">
      <span>
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </span>
      {children}
    </Label>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Guardando…
        </>
      ) : isEdit ? (
        "Guardar cambios"
      ) : (
        "Crear producto"
      )}
    </Button>
  );
}
