-- Migration: create contracts table for media inventory module
create table if not exists contratos (
  id uuid primary key default gen_random_uuid(),
  ponto_id uuid not null references pontos_inventario(id) on delete cascade,
  cliente_id bigint not null references clientes(id) on delete restrict,
  data_inicio date not null,
  data_termino date not null,
  valor_mensal numeric(10, 2) not null check (valor_mensal >= 0),
  status varchar not null check (status in ('ATIVO', 'CONCLUIDO', 'CANCELADO')) default 'ATIVO',
  created_at timestamptz not null default now()
);
