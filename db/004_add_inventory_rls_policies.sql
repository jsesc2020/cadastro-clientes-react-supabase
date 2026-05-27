-- Migration: add row level security for proprietarios and pontos_inventario tables

alter table proprietarios enable row level security;
create policy "Allow select proprietarios" on proprietarios for select using (true);
create policy "Allow insert proprietarios" on proprietarios for insert with check (true);
create policy "Allow update proprietarios" on proprietarios for update using (true) with check (true);

alter table pontos_inventario enable row level security;
create policy "Allow select pontos_inventario" on pontos_inventario for select using (true);
create policy "Allow insert pontos_inventario" on pontos_inventario for insert with check (true);
create policy "Allow update pontos_inventario" on pontos_inventario for update using (true) with check (true);
