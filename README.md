# Cadastro de Clientes e Inventário de Outdoors/TVs

Aplicação React + Tailwind + Supabase que gerencia:
- cadastro de clientes
- proprietários de mídia
- pontos de mídia (outdoors e TVs)
- contratos que vinculam clientes aos pontos
- visualização de mapa com edição rápida

> A navegação agora é baseada em rotas de URL. Use links diretos para acessar as páginas:
> `/`, `/proprietarios`, `/pontos`, `/mapa`, `/contratos`, `/clientes`
>
> Exemplos locais:
> - `http://localhost:5173/`
> - `http://localhost:5173/proprietarios`
> - `http://localhost:5173/pontos`
> - `http://localhost:5173/mapa`
> - `http://localhost:5173/contratos`
> - `http://localhost:5173/clientes`
>
> Em produção, substitua `http://localhost:5173` pelo domínio do seu deploy.

## 🚀 Início Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo e edite com suas credenciais:
```bash
copy .env.example .env
```

Defina ao menos:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
VITE_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
VITE_CPF_LOOKUP_PROVIDER=mock
```

> A chave do Google Maps deve ficar em variáveis de ambiente.

### 3. Criar tabelas no Supabase
Execute os scripts SQL na ordem:
- `db/001_create_clientes_table.sql`
- `db/002_add_rls_policies.sql`
- `db/003_create_inventory_tables.sql`
- `db/004_add_inventory_rls_policies.sql`
- `db/005_create_contracts_table.sql`
- `db/006_add_contracts_rls_policies.sql`

### 4. Rodar localmente
```bash
npm run dev
```

Acesse `http://localhost:5173`.

## 📌 Principais Páginas e Rotas

- `/` - Dashboard inicial do módulo
- `/proprietarios` - Cadastro de proprietários
- `/pontos` - Cadastro de pontos de mídia
- `/mapa` - Mapa interativo com pontos
- `/contratos` - Cadastro e lista de contratos
- `/clientes` - Cadastro e lista de clientes

## 📋 Funcionalidades

### Cadastro de Proprietário
- nome, CPF/CNPJ, telefone e dados bancários
- controle de proprietários ligados aos pontos de mídia

### Cadastro de Ponto de Mídia
- tipo (`OUTDOOR` ou `TV`)
- endereço com autocomplete do Google
- latitude/longitude obrigatórias
- vinculação a proprietário
- status de disponibilidade

### Mapa Interativo
- filtros por tipo e status
- pins coloridos por status
- mini-mapa para ajuste de coordenadas
- exibição dos dados ao clicar no ponto

### Contratos
- vincula cliente e ponto de mídia
- outdoors só podem receber um contrato ativo por vez
- TVs podem receber múltiplos contratos simultâneos
- atualiza o ponto para `LOCADO` automaticamente quando necessário
- reverte para `DISPONIVEL` ao expirar (para outdoors)
- lista de contratos com período e valor

### Clientes
- cadastro e listagem de clientes legados
- integração com formulários e contratos

## 🧪 Testes

### Comandos disponíveis
```bash
npm test
npm test:watch
npm test:coverage
```

### Cobertura atual
- validação de CPF/CNPJ
- validação de e-mail e telefone
- validação de dados de formulário

## 🌐 Deploy

### Vercel
```bash
npm i -g vercel
vercel --prod
```

Ou conecte o repositório GitHub em https://vercel.com.

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

Ou conecte seu repositório GitHub em https://app.netlify.com.

### GitHub Actions
Este repositório inclui `.github/workflows/ci-cd.yml` para:
- rodar testes
- construir o projeto
- deploy automático para Vercel/Netlify

Consulte `DEPLOY.md` para detalhes.

## 🔌 Integração de CPF

Para usar lookup de CPF com API real, configure:
```env
VITE_CPF_LOOKUP_PROVIDER=assertiva
VITE_CPF_LOOKUP_API_KEY=sua-chave-de-api
```

Atualmente o projeto usa `mock` por padrão. Veja `src/services/cpfLookupService.js`.

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ClientList.jsx
│   ├── ContractList.jsx
│   ├── ContratoForm.jsx
│   ├── CustomerForm.jsx
│   ├── InventoryMap.jsx
│   ├── ModuleDashboard.jsx
│   ├── PontoInventarioForm.jsx
│   └── ProprietarioForm.jsx
├── lib/
│   └── validations.js
├── services/
│   └── cpfLookupService.js
├── __tests__/
│   └── validations.test.js
├── App.jsx
├── main.jsx
└── supabaseClient.js

db/
├── 001_create_clientes_table.sql
├── 002_add_rls_policies.sql
├── 003_create_inventory_tables.sql
├── 004_add_inventory_rls_policies.sql
├── 005_create_contracts_table.sql
└── 006_add_contracts_rls_policies.sql

.github/
└── workflows/
    └── ci-cd.yml

vercel.json
netlify.toml
jest.config.js
package.json
package-lock.json
DEPLOY.md
```

## 🔧 Build para Produção
```bash
npm run build
npm run preview
```

## 🚨 Troubleshooting

- Verifique variáveis de ambiente em `.env`
- Confirme a URL e a chave do Supabase
- Verifique logs do navegador (F12)
- Confira o dashboard do Supabase para erros de RLS

## 📝 Próximas melhorias

- [ ] exportação em CSV/PDF
- [ ] notificações via WhatsApp
- [ ] painel de métricas e gráficos
- [ ] edição de clientes cadastrados

- [ ] Deletar clientes com soft delete
- [ ] Auditoria de mudanças
- [ ] Integração com sistemas de faturamento

## 📄 Licença

MIT

## 👤 Autor

Desenvolvido com ❤️ para gestão inteligente de clientes.

GitHub: https://github.com/jsesc2020/cadastro-clientes-react-supabase
