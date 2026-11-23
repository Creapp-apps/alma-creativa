"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertEvent, deleteEvent } from "@/app/admin/taxonomy-actions";
import { saveEventCover } from "@/app/admin/site-actions";
import { CoverCropper } from "@/components/admin/cover-cropper";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

type Initial = {
  mode: "create" | "edit";
  slug: string;
  name: string;
  blurb: string;
  sortOrder: number;
  imageUrl: string | null;
  focal: string;
};

export function EventForm({ initial }: { initial: Initial }) {
  const isEdit = initial.mode === "edit";
  const [cover, setCover] = useState<{ url: string | null; focal: string }>({
    url: initial.imageUrl,
    focal: initial.focal,
  });
  const [cropper, setCropper] = useState(false);

  return (
    <div className="grid gap-6">
      <form action={upsertEvent} className="grid gap-5">
        <input type="hidden" name="mode" value={initial.mode} />
        {isEdit ? <input type="hidden" name="slug" value={initial.slug} /> : null}

        <div className="grid gap-5 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
          <Field label="Nombre" required>
            <Input name="name" defaultValue={initial.name} required />
          </Field>
          {!isEdit ? (
            <Field label="Slug (opcional)">
              <Input name="slug" placeholder="se genera del nombre" />
            </Field>
          ) : (
            <Field label="Slug">
              <Input value={initial.slug} disabled />
            </Field>
          )}

          <div className="sm:col-span-2">
            <Field label="Descripción">
              <Textarea name="blurb" rows={2} defaultValue={initial.blurb} />
            </Field>
          </div>

          <Field label="Orden">
            <Input
              name="sort_order"
              type="number"
              defaultValue={initial.sortOrder}
            />
          </Field>

          {isEdit ? (
            <Field label="Foto de portada">
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
                  {cover.url ? "Cambiar portada" : "Subir portada"}
                </span>
              </button>
            </Field>
          ) : null}
        </div>

        <div>
          <SaveButton isEdit={isEdit} />
        </div>
      </form>

      {isEdit ? (
        <form action={deleteEvent}>
          <input type="hidden" name="slug" value={initial.slug} />
          <ConfirmSubmit
            label="Eliminar evento"
            title="¿Eliminar evento?"
            description="Se eliminará el evento. Esta acción no se puede deshacer."
          />
        </form>
      ) : null}

      {cropper ? (
        <CoverCropper
          title={`Portada · ${initial.name}`}
          pathPrefix={`events/${initial.slug}`}
          initialUrl={cover.url}
          initialFocal={cover.focal}
          onSave={async (url, focal) => {
            await saveEventCover(initial.slug, url, focal);
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

function SaveButton({ isEdit }: { isEdit: boolean }) {
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
        "Crear evento"
      )}
    </Button>
  );
}
