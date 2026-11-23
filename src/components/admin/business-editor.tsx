"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Loader2, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CONDICIONES_IVA,
  type BusinessSettings,
} from "@/lib/business";
import { saveBusinessSettings } from "@/app/admin/business-actions";

type PublicData = {
  name: string;
  whatsapp: string;
  email: string;
  instagram: string;
};

export function BusinessEditor({
  initial,
  publicData,
}: {
  initial: BusinessSettings;
  publicData: PublicData;
}) {
  const [data, setData] = useState<BusinessSettings>(initial);
  const [baseline, setBaseline] = useState<BusinessSettings>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(data) !== JSON.stringify(baseline);

  function set<S extends keyof BusinessSettings>(
    section: S,
    patch: Partial<BusinessSettings[S]>,
  ) {
    setSaved(false);
    setData((d) => ({ ...d, [section]: { ...d[section], ...patch } }));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveBusinessSettings(data);
        setBaseline(data);
        setSaved(true);
        toast.success("Datos del negocio guardados");
      } catch {
        toast.error("No se pudo guardar. Reintentá.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Datos del negocio</h1>
          <p className="text-sm text-muted-foreground">
            Información interna y operativa. No se muestra en el sitio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && !dirty ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="size-4" /> Guardado
            </span>
          ) : null}
          {dirty ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setData(baseline);
                setSaved(false);
              }}
            >
              <RotateCcw className="size-4" />
              Descartar
            </Button>
          ) : null}
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Datos fiscales / legales */}
        <Section title="Datos fiscales">
          <F label="Razón social">
            <Input
              value={data.legal.razonSocial}
              placeholder="Alma Creativa S.A.S."
              onChange={(e) => set("legal", { razonSocial: e.target.value })}
            />
          </F>
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="CUIT">
              <Input
                value={data.legal.cuit}
                placeholder="30-12345678-9"
                onChange={(e) => set("legal", { cuit: e.target.value })}
              />
            </F>
            <F label="Condición IVA">
              <select
                value={data.legal.condicionIva}
                onChange={(e) =>
                  set("legal", {
                    condicionIva: e.target
                      .value as BusinessSettings["legal"]["condicionIva"],
                  })
                }
                className={cn(
                  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
                )}
              >
                <option value="">Sin especificar</option>
                {CONDICIONES_IVA.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </F>
          </div>
        </Section>

        {/* Ubicación */}
        <Section title="Ubicación">
          <F label="Dirección">
            <Input
              value={data.ubicacion.direccion}
              placeholder="Av. Siempre Viva 742"
              onChange={(e) => set("ubicacion", { direccion: e.target.value })}
            />
          </F>
          <div className="grid gap-5 sm:grid-cols-2">
            <F label="Ciudad">
              <Input
                value={data.ubicacion.ciudad}
                onChange={(e) => set("ubicacion", { ciudad: e.target.value })}
              />
            </F>
            <F label="Provincia">
              <Input
                value={data.ubicacion.provincia}
                onChange={(e) => set("ubicacion", { provincia: e.target.value })}
              />
            </F>
          </div>
          <F label="Código postal">
            <Input
              value={data.ubicacion.codigoPostal}
              placeholder="1406"
              onChange={(e) =>
                set("ubicacion", { codigoPostal: e.target.value })
              }
            />
          </F>
        </Section>

        {/* Operación */}
        <Section title="Operación">
          <F label="Zona de entrega">
            <Input
              value={data.operacion.zonaEntrega}
              placeholder="CABA y GBA"
              onChange={(e) =>
                set("operacion", { zonaEntrega: e.target.value })
              }
            />
          </F>
          <F label="Horarios de atención">
            <Input
              value={data.operacion.horarios}
              placeholder="9 a 18 h"
              onChange={(e) => set("operacion", { horarios: e.target.value })}
            />
          </F>
          <F label="Días de atención">
            <Input
              value={data.operacion.diasAtencion}
              placeholder="Lunes a viernes"
              onChange={(e) =>
                set("operacion", { diasAtencion: e.target.value })
              }
            />
          </F>
        </Section>

        {/* Notas internas */}
        <Section title="Notas internas">
          <F label="Notas">
            <Textarea
              rows={5}
              value={data.interno.notas}
              placeholder="Datos bancarios, proveedores, recordatorios…"
              onChange={(e) => set("interno", { notas: e.target.value })}
            />
          </F>
        </Section>
      </div>

      {/* Datos públicos (se editan en Sitio) */}
      <div className="rounded-xl border border-dashed border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Datos públicos</p>
            <p className="text-xs text-muted-foreground">
              Nombre, WhatsApp, email e Instagram se muestran en el sitio y se
              editan en Sitio web → Contenido.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/sitio" />}
          >
            Editar en Sitio
            <ExternalLink className="size-4" />
          </Button>
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Readonly label="Nombre" value={publicData.name} />
          <Readonly label="WhatsApp" value={publicData.whatsapp} />
          <Readonly label="Email" value={publicData.email} />
          <Readonly label="Instagram" value={publicData.instagram} />
        </dl>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-border p-5">
      <p className="text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      {children}
    </Label>
  );
}

function Readonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value || "—"}</dd>
    </div>
  );
}
