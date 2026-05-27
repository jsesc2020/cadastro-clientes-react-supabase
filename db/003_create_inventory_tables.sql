-- Migration: create owner and inventory tables for the media inventory module
create extension if not exists "pgcrypto";

create table if not exists proprietarios (
  id uuid primary key default gen_random_uuid(),
  nome_completo varchar not null,
  cpf_cnpj varchar not null unique,
  telefone varchar,
  dados_bancarios jsonb,
  created_at timestamptz not null default now()
);

create table if not exists pontos_inventario (
  id uuid primary key default gen_random_uuid(),
  tipo varchar not null check (tipo in ('OUTDOOR', 'TV')),
  identificacao varchar not null,
  endereco_completo text,
  latitude numeric(10, 8) not null,
  longitude numeric(11, 8) not null,
  status varchar not null check (status in ('DISPONIVEL', 'LOCADO', 'MANUTENCAO')),
  proprietario_id uuid not null references proprietarios(id) on delete restrict,
  valor_custo_proprietario numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);
