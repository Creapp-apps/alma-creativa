-- Fotos de productos: columna image_url + bucket de Storage.

alter table public.products
  add column if not exists image_url text;

-- Bucket público para fotos de productos.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- Policies sobre storage.objects para ese bucket.
-- Lectura pública; escritura solo staff autenticado.
drop policy if exists "product_photos_public_read" on storage.objects;
create policy "product_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'product-photos');

drop policy if exists "product_photos_auth_insert" on storage.objects;
create policy "product_photos_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos');

drop policy if exists "product_photos_auth_update" on storage.objects;
create policy "product_photos_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-photos')
  with check (bucket_id = 'product-photos');

drop policy if exists "product_photos_auth_delete" on storage.objects;
create policy "product_photos_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos');
