# Módulo de Inventário de Outdoors e TVs (React + Tailwind + Supabase)

Este projeto agora inclui um módulo de cadastro para gerenciar inventário físico de outdoors e TVs, com:
- ✅ Cadastro de proprietários com dados bancários (Pix, banco, agência e conta)
- ✅ Cadastro de pontos de mídia com endereço, geocodificação e coordenadas
- ✅ Tela de mapa interativo com filtros por tipo e status
- ✅ Marcações coloridas e InfoWindow com dados do ponto
- ✅ Validação de latitude/longitude obrigatória antes de salvar
- ✅ Integração com Google Places API para autocomplete de endereço
- ✅ Mini-mapa de ajuste de posição para refinar coordenadas
- ✅ Tabelas novas no Supabase: `proprietarios` e `pontos_inventario`
- ✅ RLS básico para ambas tabelas

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase e a chave do Google Maps:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
VITE_CPF_LOOKUP_PROVIDER=mock
```

> A chave do Google Maps deve ser mantida em variáveis de ambiente e não codificada diretamente no código.

### 3. Criar tabelas no Supabase

Vá para SQL Editor no painel do Supabase e execute os scripts em `db/003_create_inventory_tables.sql`, `db/004_add_inventory_rls_policies.sql`, `db/005_create_contracts_table.sql` e `db/006_add_contracts_rls_policies.sql`.

Se você quiser manter o cadastro de clientes legados, também pode executar:

```sql
-- db/001_create_clientes_table.sql
-- db/002_add_rls_policies.sql
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```

Abra `http://localhost:5173` no navegador.

## 📋 Funcionalidades do Módulo de Inventário

### Cadastro de Proprietário
- **Nome completo**
- **CPF/CNPJ único**
- **Telefone**
- **Dados bancários em JSONB** (Pix, banco, agência, conta)

### Cadastro de Ponto de Mídia
- **Tipo**: Outdoor ou TV
- **Identificação descritiva**
- **Proprietário vinculado**
- **Endereço com autocomplete do Google**
- **Latitude/Longitude obrigatórias**
- **Valor de custo mensal**
- **Status**: Disponível, Locado, Manutenção

### Dashboard do Mapa Interativo
- **Filtros por tipo e status**
- **Pins coloridos** para cada status
- **InfoWindow** com detalhes do ponto
- **Painel de seleção** para exibir dados do ponto clicado
- **Visualização de pontos no mapa em tempo real**

### Contratos
- **Cadastro de contratos** para vincular cliente + ponto de mídia
- **Atualização automática de status** do ponto para `LOCADO` quando o contrato estiver ativo
- **Retorno para `DISPONIVEL`** quando o contrato expirar
- **Lista de contratos** com cliente, período e valor mensal

### Regras de Negócio
- O sistema não permite salvar ponto se latitude/longitude estiverem vazias
- Quando o contrato for criado, o ponto passa para `LOCADO`
- Quando o contrato vencer, o ponto volta para `DISPONIVEL`

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

Testes atuais incluem validações básicas de CPF/CNPJ, e-mail e telefone.

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
