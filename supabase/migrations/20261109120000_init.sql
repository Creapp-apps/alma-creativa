-- Alma Creativa — esquema inicial (catálogo + leads)
-- Capa 3. Correr en el proyecto Supabase (SQL Editor o `supabase db push`).

-- ------------------------------------------------------------------
-- Catálogo
-- ------------------------------------------------------------------

create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  short       text not null default '',
  icon        text not null default 'Gift',   -- nombre del ícono lucide
  tint        text not null default '#efeae1', -- color del tile (placeholder)
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.events (
  slug        text primary key,
  name        text not null,
  blurb       text not null default '',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  slug         text primary key,
  name         text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  blurb        text not null default '',
  details      text[] not null default '{}',
  price_note   text not null default 'Presupuesto a medida',
  price_from   numeric not null default 0,  -- orientativo; se muestra solo si showEstimate = true
  featured     boolean not null default false,
  active       boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- Relación producto <-> evento (muchos a muchos)
create table if not exists public.product_events (
  product_slug text not null references public.products(slug) on delete cascade,
  event_slug   text not null references public.events(slug)   on delete cascade,
  primary key (product_slug, event_slug)
);

create index if not exists products_category_idx on public.products(category_slug);
create index if not exists product_events_event_idx on public.product_events(event_slug);

-- ------------------------------------------------------------------
-- Leads (pedidos del cotizador / formularios)
-- ------------------------------------------------------------------

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text,
  event_slug text references public.events(slug) on delete set null,
  event_date text,                 -- fecha libre que carga el cliente (texto)
  guests     int,
  comments   text,
  source     text not null default 'web',
  status     text not null default 'nuevo',  -- nuevo | contactado | presupuestado | ganado | perdido
  created_at timestamptz not null default now()
);

create table if not exists public.lead_items (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads(id) on delete cascade,
  product_slug text references public.products(slug) on delete set null,
  product_name text not null,      -- snapshot del nombre al momento del pedido
  qty          int not null default 1,
  created_at   timestamptz not null default now()
);

create index if not exists lead_items_lead_idx on public.lead_items(lead_id);
create index if not exists leads_created_idx on public.leads(created_at desc);

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
-- Catálogo: lectura pública (anon). Escritura solo service_role / staff.
-- Leads: SIN acceso anon. Se insertan server-side con service_role (API route
--   valida con Zod antes). El staff autenticado puede leer y actualizar.

alter table public.categories     enable row level security;
alter table public.events         enable row level security;
alter table public.products       enable row level security;
alter table public.product_events enable row level security;
alter table public.leads          enable row level security;
alter table public.lead_items     enable row level security;

-- Lectura pública del catálogo
create policy "catalog_read_categories"
  on public.categories for select using (true);

create policy "catalog_read_events"
  on public.events for select using (true);

create policy "catalog_read_products"
  on public.products for select using (active = true);

create policy "catalog_read_product_events"
  on public.product_events for select using (true);

-- Staff autenticado administra el catálogo
create policy "staff_write_categories"
  on public.categories for all to authenticated using (true) with check (true);

create policy "staff_write_events"
  on public.events for all to authenticated using (true) with check (true);

create policy "staff_write_products"
  on public.products for all to authenticated using (true) with check (true);

create policy "staff_write_product_events"
  on public.product_events for all to authenticated using (true) with check (true);

-- Leads: solo staff autenticado lee/actualiza. (Insert público lo hace el
-- service_role desde la API, que saltea RLS.)
create policy "staff_read_leads"
  on public.leads for select to authenticated using (true);

create policy "staff_update_leads"
  on public.leads for update to authenticated using (true) with check (true);

create policy "staff_read_lead_items"
  on public.lead_items for select to authenticated using (true);
