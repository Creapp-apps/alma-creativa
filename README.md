# Alma Creativa — Sitio web

Sitio público + catálogo para **Alma Creativa** (papelería premium para eventos).
Desarrollado por **CreAPP**.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (variante `@base-ui/react`)
- lucide-react

## Correr

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm start       # servir el build
```

## Estado — Capas 1 y 2 (actual)

Sitio público + cotizador con **datos de ejemplo (mock)**, sin backend todavía.

**Capa 1 — sitio + catálogo**
- `/` — home (hero, categorías, destacados, eventos, proceso, CTA)
- `/catalogo` — grilla filtrable por categoría y evento
- `/catalogo/[slug]` — detalle de producto
- Pedidos derivados a **WhatsApp** (links `wa.me` con mensaje prearmado).

**Capa 2 — cotizador + captura de leads**
- `/cotizador` — "Armá tu pedido" en 3 pasos (datos de contacto/evento → productos con cantidades → resumen y envío). Prefill por query: `?producto=<slug>&evento=<slug>`.
- `POST /api/leads` — valida con Zod (`src/lib/schemas.ts`) y guarda el lead con `saveLead()` (`src/lib/leads.ts`, hoy **stub** que loguea; seam listo para Supabase).
- Al enviar, además arma un link de WhatsApp con todo el pedido (fallback: ningún lead se pierde sin backend).
- **Estimación en pesos oculta** por `showEstimate = false` en `src/lib/pricing.ts`. El motor de cálculo ya existe; cargar precios reales en `priceFrom` y poner `showEstimate = true` cuando el cliente confirme montos.

## Capa 3 — Supabase (CONECTADO ✅)

Proyecto `sctudzctvradgsthnnis`: esquema + seed aplicados (`supabase db push --remote=<pooler>`), y los **leads del cotizador persisten** (probado end-to-end). Ver **[SUPABASE.md](./SUPABASE.md)**.

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL` se **inlinea en build**. En `npm run dev` anda en runtime, pero para `npm run build`/`npm start` (y en Vercel) hay que buildear **con el `.env.local` cargado** (o las env vars seteadas), si no el server cae al stub. Regla: cambiaste `.env` → rebuild.

- `supabase/migrations/001_init.sql` + `supabase/seed.sql` (catálogo espejo del mock) con RLS.
- Clientes en `src/lib/supabase/` (`client`, `server`, `admin`, `config`).
- `saveLead()` inserta en Supabase si hay `SUPABASE_SERVICE_ROLE_KEY`; si no, sigue en stub.
- `.env.local` creado (vacío) para pegar credenciales.

## Capa 3b — Catálogo desde DB + CRM (HECHO ✅)

**Catálogo desde Supabase** (con fallback a mock si no hay env):
- `src/lib/catalog.ts` — acceso cacheable (`"use cache"`): `getCategories/getEvents/getProducts/getFeaturedProducts/getProductBySlug`.
- `src/lib/icons.ts` — resuelve el nombre de ícono (string de la DB) al componente lucide.
- `src/lib/supabase/public.ts` — cliente anon sin cookies para lecturas cacheables.
- Home, `/catalogo` y `/cotizador` leen del catálogo (server) y pasan datos a los componentes cliente por props.

**CRM / back-office** (`/admin`):
- Rutas públicas movidas a `src/app/(site)/` (con su layout de header/footer). `/admin` tiene su propio layout limpio.
- `src/proxy.ts` (Next 16 renombró `middleware.ts`→`proxy.ts`) + `src/lib/supabase/session.ts`: refresca sesión y protege `/admin` (sin login → redirect a `/admin/login`).
- `/admin/login` — email + password (Supabase Auth). `/admin` — listado de leads con ítems, contacto (WhatsApp/email), y cambio de estado (`nuevo→contactado→presupuestado→ganado/perdido`) vía server action. RLS: lee/actualiza solo `authenticated`.

### Usuario de staff

Para entrar a `/admin/login`. Ya existe uno: **admin@almacreativa.com**.
Crear más: Dashboard → **Authentication** → **Users** → **Add user** (email + password + "Auto Confirm User").

## Fotos en Storage + ABM de catálogo (HECHO ✅)

**Fotos** (Storage):
- Migration `20261109130000_catalog_images.sql`: columna `products.image_url` + bucket **`product-photos`** (público) + policies (lectura pública, escritura `authenticated`).
- `next.config.ts` habilita `**.supabase.co` para `next/image`.
- Público: `ProductTile` muestra la foto si existe; si no, el tile con ícono.

**ABM de catálogo** (`/admin/catalogo`):
- Listado de productos (activos e inactivos) con thumbnail/estado.
- Alta (`/admin/catalogo/nuevo`) y edición (`/admin/catalogo/[slug]`): nombre, categoría, precio, destacado/activo, descripción, detalles, eventos (checkboxes) y **subida de foto**. Baja con confirmación.
- Server actions `src/app/admin/catalogo-actions.ts` (`upsertProduct`/`deleteProduct`): suben la foto al bucket, guardan el producto + relación de eventos, e invalidan el caché del catálogo (`revalidateTag("catalog", "max")`).
- El catálogo público usa `cacheTag("catalog")`, así los cambios del back-office se reflejan tras la invalidación.

## Puntos de SWAP de branding (cuando llegue el Drive del cliente)

Buscar `TODO(branding)` / `TODO(cliente)` en el código. Centralizado en:

- **Colores**: `src/app/globals.css` → tokens en `:root` (tema placeholder "Papel & Tinta": papel `#faf7f2`, tinta `#211e26`, oro `#8a6e35`).
- **Fuentes**: `src/app/layout.tsx` → `Fraunces` (display) + `Instrument_Sans` (body).
- **Logo**: `src/components/wordmark.tsx` (hoy es wordmark de texto; reemplazar por el logo real).
- **Datos de contacto** (WhatsApp real, email, IG): `src/lib/site.ts`.
- **Catálogo / fotos**: `src/lib/data.ts` (mock) + `src/components/product-tile.tsx` (tiles placeholder → fotos).
