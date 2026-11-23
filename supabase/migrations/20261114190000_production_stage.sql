-- Etapa de producción (kanban del Tablero), independiente del status de ventas.
-- Valores: pendiente | en_produccion | listo | entregado
alter table public.leads
  add column if not exists production_stage text not null default 'pendiente';

create index if not exists leads_stage_idx on public.leads(production_stage);
