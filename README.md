# Cadastro de Clientes (React + Tailwind + Supabase)

Módulo completo de gestão de clientes (Pessoa Física e Jurídica) com:
- ✅ Máscara de CPF (000.000.000-00) e CNPJ (00.000.000/0000-00)
- ✅ Validação matemática de CPF e CNPJ com dígito verificador
- ✅ Validação robusta de e-mail e telefone
- ✅ Integração com **BrasilAPI** para busca de dados de CNPJ
- ✅ Integração com **ViaCEP** para auto-preenchimento de endereço via CEP
- ✅ Integração com **Supabase** para checagem de duplicidade e persistência
- ✅ **Componente de lista de clientes** com filtros e paginação
- ✅ **RLS (Row Level Security)** no Supabase
- ✅ **Testes unitários** com Jest e React Testing Library
- ✅ **Deploy automático** (Vercel, Netlify, GitHub Actions)
- ✅ **Estrutura para integração com Assertiva/Serasa** (CPF lookup pago)
- ✅ Mensagens de erro inline com validação em tempo real
- ✅ Interface responsiva com Tailwind CSS

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_CPF_LOOKUP_PROVIDER=mock
```

### 3. Criar tabela no Supabase

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

Depois execute a migration de RLS:

```sql
-- (Copie o conteúdo de db/002_add_rls_policies.sql)
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

Abra `http://localhost:5173` no navegador.

## 📋 Funcionalidades

### Cadastro de Clientes
- **Formulário completo** com máscara e validação em tempo real
- **Busca inteligente** por CNPJ (BrasilAPI) e CEP (ViaCEP)
- **Auto-preenchimento** de dados cadastrais
- **Validações robustas** com mensagens de erro inline
- **Checagem de duplicidade** antes de salvar

### Lista de Clientes
- **Tabela responsiva** com todos os cadastros
- **Filtros por tipo** (Pessoa Física/Jurídica) e busca por nome/CPF/CNPJ
- **Paginação** com 10 clientes por página
- **Formatação automática** de CPF/CNPJ e datas

### Segurança
- **RLS (Row Level Security)** ativado no Supabase
- **Validação de CPF/CNPJ** com algoritmo de dígito verificador
- **Prevenção de duplicatas** via constraint UNIQUE
- **Dados criptografados** em repouso (Supabase)

## 🧪 Testes

### Rodar testes
```bash
npm test
```

### Modo watch
```bash
npm test:watch
```

### Cobertura de código
```bash
npm test:coverage
```

Testes incluem:
- ✅ Validação de CPF/CNPJ
- ✅ Validação de e-mail e telefone
- ✅ Formatação de entrada
- ✅ Casos especiais (números repetidos, etc)

## 🌐 Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel --prod
```

Ou conecte seu repositório GitHub direto em https://vercel.com

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

Ou conecte seu repositório GitHub direto em https://app.netlify.com

### GitHub Actions (CI/CD)
O repositório inclui workflow que:
- Roda testes automaticamente
- Faz build do projeto
- Deploy automático para Vercel/Netlify

Veja [DEPLOY.md](DEPLOY.md) para instruções detalhadas.

## 🔌 Integração com APIs de CPF (Assertiva/Serasa)

Para ativar lookup de CPF com dados reais (serviço pago):

### 1. Escolher provedor

Opções:
- **Assertiva** (https://assertiva.com.br) - Recomendado
- **Serasa** (https://www.serasa.com.br) - Popular
- **BigDataCorp** (https://www.bigdatacorp.com.br) - Budget-friendly

### 2. Configurar variáveis de ambiente

```env
VITE_CPF_LOOKUP_PROVIDER=assertiva
VITE_CPF_LOOKUP_API_KEY=sua-chave-de-api
```

### 3. Usar no formulário

O componente detectará automaticamente a configuração e habilitará o lookup de CPF!

Atualmente usa mock (desenvolvimento). Veja [src/services/cpfLookupService.js](src/services/cpfLookupService.js).

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── CustomerForm.jsx       # Formulário de cadastro
│   └── ClientList.jsx         # Lista de clientes com filtros
├── lib/
│   └── validations.js         # Funções de validação robustas
├── services/
│   └── cpfLookupService.js    # Integração com APIs de CPF
├── __tests__/
│   └── validations.test.js    # Testes unitários
├── supabaseClient.js
├── App.jsx
└── main.jsx

db/
├── 001_create_clientes_table.sql
└── 002_add_rls_policies.sql

.github/
└── workflows/
    └── ci-cd.yml              # GitHub Actions

vercel.json
netlify.toml
jest.config.js
.babelrc
DEPLOY.md
```

## 🔧 Configuração Avançada

### Adicionar autenticação

1. Habilitar autenticação no Supabase (Auth)
2. Descomentar policies de RLS para "authenticated users only"
3. Adicionar middleware de autenticação no React

### Adicionar mais campos

1. Alterar schema em Supabase
2. Atualizar `src/components/CustomerForm.jsx`
3. Adicionar validações em `src/lib/validations.js`

### Integrar com sistema existente

- Supabase fornece Webhooks para sincronizar dados
- REST API disponível para integrações

## 📊 Build para Produção

```bash
npm run build
npm run preview
```

## 🚨 Troubleshooting

### Erro "CPF/CNPJ não encontrado"
- A API (BrasilAPI/ViaCEP) pode estar temporariamente indisponível
- Verifique a conexão de internet
- Tente novamente em alguns segundos

### Erro "Este cliente já está cadastrado"
- Já existe um cliente com este CPF/CNPJ no banco
- Use o nome cadastrado ou remova o cliente anterior

### Erro de Supabase
- Verifique as variáveis de ambiente
- Confirme que as credenciais estão corretas
- Tente regenerar as chaves em Supabase dashboard

## 📝 Próximas Funcionalidades

- [ ] Exportar clientes em CSV/PDF
- [ ] Integração com WhatsApp para notificações
- [ ] Dashboard com estatísticas
- [ ] Edição de clientes cadastrados
- [ ] Deletar clientes com soft delete
- [ ] Auditoria de mudanças
- [ ] Integração com sistemas de faturamento

## 📄 Licença

MIT

## 👤 Autor

Desenvolvido com ❤️ para gestão inteligente de clientes.

GitHub: https://github.com/jsesc2020/cadastro-clientes-react-supabase
