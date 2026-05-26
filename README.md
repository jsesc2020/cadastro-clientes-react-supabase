# Cadastro de Clientes (React + Tailwind + Supabase)

Módulo completo de cadastro de clientes (Pessoa Física e Jurídica) com:
- ✅ Máscara de CPF (000.000.000-00) e CNPJ (00.000.000/0000-00)
- ✅ Validação matemática de CPF (algoritmo de dígito verificador)
- ✅ Integração com **BrasilAPI** para busca de dados de CNPJ
- ✅ Integração com **ViaCEP** para auto-preenchimento de endereço via CEP
- ✅ Integração com **Supabase** para checagem de duplicidade e persistência
- ✅ Máscaras de entrada sem dependência de biblioteca externa
- ✅ Feedback visual com mensagens de sucesso/erro

## Setup Rápido

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

Você encontra essas chaves em:
- Supabase Dashboard → Settings → API → URL e anon key

3. **Criar tabela no Supabase**

Vá para SQL Editor no painel do Supabase e execute:

```sql
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
```

4. **Rodar em desenvolvimento**
```bash
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Fluxos Testados e Funcionais

### CPF (Pessoa Física)
- Máscara automática: `111.444.777-35`
- Validação matemática de CPF
- Preenchimento manual de nome/endereço
- Auto-preenchimento de endereço via CEP (ViaCEP)

### CNPJ (Pessoa Jurídica)
- Máscara automática: `34.028.316/0001-07`
- Busca de dados na BrasilAPI (Receita Federal)
- Suporte a Inscrição Estadual
- Auto-preenchimento de endereço via CEP

### Validações
- Campos obrigatórios: razão social, e-mail, telefone, endereço completo
- Validação de e-mail básica (contém @)
- Checagem de duplicidade (CPF/CNPJ já cadastrado)
- Mensagens de feedback em tempo real

## Build para produção

```bash
npm run build
npm run preview
```

## Próximas Melhorias Opcionais

- Integração com Assertiva/Serasa para consulta de CPF (pago)
- Validação de e-mail e telefone mais robusta
- Testes automatizados (Jest + React Testing Library)
- Componente de lista/tabela de clientes cadastrados
- Autenticação e autorização (RLS no Supabase)
- Deploy automático (Vercel/Netlify)
