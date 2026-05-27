-- Migration: add row level security for contratos table

alter table contratos enable row level security;
create policy "Allow select contratos" on contratos for select using (true);
create policy "Allow insert contratos" on contratos for insert with check (true);
create policy "Allow update contratos" on contratos for update using (true) with check (true);
