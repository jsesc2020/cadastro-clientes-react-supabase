# Guia de Deploy

Este documento contém instruções para fazer deploy da aplicação em diferentes plataformas.

## Deploy na Vercel

### Automático (recomendado)

1. **Conectar repositório GitHub**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Selecione seu repositório GitHub `cadastro-clientes-react-supabase`

2. **Configurar variáveis de ambiente**
   - Na página de configuração, adicione:
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-publica
     ```

3. **Deploy**
   - Clique em "Deploy"
   - Espere a build terminar
   - URL do seu site será gerada automaticamente

4. **Deploys automáticos**
   - Qualquer push para `main` dispara um novo deploy

### Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

## Deploy na Netlify

### Automático (recomendado)

1. **Conectar repositório GitHub**
   - Acesse https://app.netlify.com
   - Clique em "New site from Git"
   - Selecione seu repositório GitHub

2. **Configurar build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Variáveis de ambiente**
   - Em "Site settings" → "Build & deploy" → "Environment":
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-publica
     ```

4. **Deploy**
   - Clique em "Deploy site"
   - Espere a build terminar

### Manual

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod
```

## Deploy com GitHub Actions (CI/CD)

O repositório já inclui `.github/workflows/ci-cd.yml` que:
- Roda testes automaticamente
- Faz build do projeto
- Deploy automático para Vercel/Netlify em push para `main`

### Configurar secrets do GitHub

1. Vá para Settings → Secrets and variables → Actions
2. Adicione os seguintes secrets:

**Para Vercel:**
- `VERCEL_TOKEN`: Token de acesso do Vercel
- `VERCEL_ORG_ID`: ID da organização Vercel
- `VERCEL_PROJECT_ID`: ID do projeto Vercel

**Para Netlify:**
- `NETLIFY_AUTH_TOKEN`: Token de autenticação
- `NETLIFY_SITE_ID`: ID do site

Você encontra essas informações em:
- Vercel: https://vercel.com/account/tokens
- Netlify: Site settings → General → Site ID e API token

## Deploy via Docker

### Criar Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

### Build e rodar

```bash
docker build -t cadastro-clientes .
docker run -p 3000:3000 -e VITE_SUPABASE_URL=... -e VITE_SUPABASE_ANON_KEY=... cadastro-clientes
```

## Variáveis de Ambiente

### Obrigatórias

- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Opcionais

- `VITE_CPF_LOOKUP_PROVIDER`: Provedor de lookup de CPF (`mock`, `assertiva`, `serasa`, `bigdatacorp`)
- `VITE_CPF_LOOKUP_API_KEY`: Chave de API do provedor escolhido

## Checklist de Deploy

- [ ] Testes passando localmente (`npm test`)
- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Tabela `clientes` criada no Supabase
- [ ] RLS policies aplicadas (if using authentication)
- [ ] Domain customizado configurado (opcional)
- [ ] SSL ativado (automático em Vercel/Netlify)
- [ ] Monitoramento configurado

## Monitoramento

### Logs

**Vercel:**
- Dashboard → Deployments → Logs

**Netlify:**
- Site settings → Deploy & Manage → Logs

### Erros

Verifique o console do navegador (F12) para erros frontend.

Para erros de API do Supabase, verifique:
- Supabase dashboard → Logs
- RLS policies ativadas
- Credenciais corretas

## Rollback

**Vercel:**
- Dashboard → Deployments → Selecione versão anterior → "Promote to Production"

**Netlify:**
- Deploys → Selecione deploy anterior → "Publish deploy"

## Performance

### Análise

- https://pagespeed.web.dev/ (Google PageSpeed Insights)
- Vercel Analytics (dashboard)
- Netlify Analytics (dashboard)

### Otimizações

- Lazy loading de componentes
- Code splitting automático pelo Vite
- Compressão gzip ativada por padrão
- Cache headers configurados

## Suporte

Para problemas:
1. Verifique os logs
2. Confira as variáveis de ambiente
3. Teste localmente
4. Consulte a documentação das plataformas
