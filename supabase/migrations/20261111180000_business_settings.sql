-- Datos del negocio: info interna/operativa (una fila JSONB).
-- Los defaults viven en TS (src/lib/business.ts); esta tabla guarda los valores.
-- Datos internos: solo staff autenticado lee y escribe (no es contenido público).

create table if not exists public.business_settings (
  id         text primary key default 'default',
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.business_settings enable row level security;

-- Lectura solo staff autenticado (datos internos, no se exponen en el sitio).
drop policy if exists "business_settings_read" on public.business_settings;
create policy "business_settings_read"
  on public.business_settings for select to authenticated using (true);

-- Escritura solo staff autenticado.
drop policy if exists "business_settings_write" on public.business_settings;
create policy "business_settings_write"
  on public.business_settings for all to authenticated
  using (true) with check (true);
