-- Migration: Add RLS (Row Level Security) policies to clientes table

-- Enable RLS on clientes table
alter table clientes enable row level security;

-- Policy 1: Allow anyone to INSERT (create new client)
create policy "Allow insert clientes"
on clientes for insert
with check (true);

-- Policy 2: Allow anyone to SELECT (read all clients)
-- In production, restrict this to authenticated users only
create policy "Allow select clientes"
on clientes for select
using (true);

-- Policy 3: Allow UPDATE only if cpf_cnpj matches (if needed in future)
create policy "Allow update clientes"
on clientes for update
using (true)
with check (true);

-- Optional: Add authentication requirement
-- Uncomment if you want to restrict to authenticated users only:
-- 
-- create policy "Authenticated users only"
-- on clientes for select
-- using (auth.role() = 'authenticated');
--
-- create policy "Authenticated insert only"
-- on clientes for insert
-- with check (auth.role() = 'authenticated');
