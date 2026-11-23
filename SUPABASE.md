# Supabase — puesta en marcha

Maqueta de la capa 3 (backend). El sitio funciona **sin** Supabase (mock + stub);
en cuanto cargues las credenciales, los **leads del cotizador se guardan solos**.

## 1. Crear el proyecto

En https://supabase.com → New project. Anotá la contraseña de la DB.

## 2. Cargar credenciales

Project Settings → **API**. Copiá a `.env.local` (ya está creado, vacío):

```
NEXT_PUBLIC_SUPABASE_URL=https://TUPROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # service_role (SECRETA)
SUPABASE_PROJECT_ID=TUPROYECTO              # el subdominio de la URL
```

> `SUPABASE_SERVICE_ROLE_KEY` es secreta: nunca al cliente, nunca con prefijo `NEXT_PUBLIC_`.

## 3. Crear las tablas y los datos

**Opción A — rápida (SQL Editor del dashboard):**
1. Pegá y corré `supabase/migrations/001_init.sql`.
2. Pegá y corré `supabase/seed.sql`.

**Opción B — con Supabase CLI:**
```bash
npx supabase link --project-ref "$SUPABASE_PROJECT_ID"
npx supabase db push          # aplica migrations/
npm run db:seed               # carga seed.sql
```

## 4. (Opcional) Regenerar tipos

Tras cualquier cambio de esquema:
```bash
npm run db:types              # escribe src/types/database.types.ts
```

## 5. Listo

- Reiniciá `npm run dev`. El cotizador ahora inserta en `leads` + `lead_items`.
- Probalo: cargá un pedido en `/cotizador` → debería aparecer en la tabla `leads`
  (Table editor del dashboard).

## Qué quedó hecho vs. pendiente

**Hecho (maqueta):**
- Esquema: `categories`, `events`, `products`, `product_events`, `leads`, `lead_items` con RLS.
- Clientes en `src/lib/supabase/` (`client`, `server`, `admin`, `config`).
- `saveLead()` (`src/lib/leads.ts`) inserta en Supabase si hay `service_role`; si no, stub.
- Seed con el catálogo actual.

**Pendiente (capa 3b):**
- Que el **catálogo** del sitio lea de Supabase en vez del mock (`src/lib/data.ts`).
  Hoy la DB ya tiene los datos; falta cambiar las páginas a lectura async.
- **Back-office / CRM** para ver y gestionar los leads (login de staff + listado).
  RLS ya permite lectura a usuarios `authenticated`.
- Fotos de productos en Supabase Storage.
