-- Migration: create clientes table
create table if not exists clientes (
  id bigserial primary key,
  tipo text,
  cpf_cnpj text unique,
  razao_nome text,
  fantasia_apelido text,
  inscricao_estadual text,
  email text,
  telefone text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  created_at timestamptz default now()
);
