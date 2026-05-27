# Guia de Deploy

Este documento explica como publicar a aplicação em Vercel, Netlify ou via GitHub Actions.

## Deploy na Vercel

### Automático (recomendado)

1. Acesse https://vercel.com
2. Clique em **New Project**
3. Conecte o repositório GitHub `cadastro-clientes-react-supabase`
4. Configure as variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-publica
   VITE_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
   ```
5. Clique em **Deploy**

O deploy será gerado automaticamente e qualquer push em `main` dispara nova build.

### Manual

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## Deploy na Netlify

### Automático (recomendado)

1. Acesse https://app.netlify.com
2. Clique em **New site from Git**
3. Conecte o repositório GitHub
4. Configure build:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Adicione variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-publica
   VITE_GOOGLE_MAPS_API_KEY=sua-chave-google-maps
   ```
6. Clique em **Deploy site**

### Manual

```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

## GitHub Actions (CI/CD)

O repositório inclui `.github/workflows/ci-cd.yml` para:
- rodar testes
- fazer build do projeto
- deploy automático em push para `main`

### Configurar secrets do GitHub

Adicione os secrets no GitHub repository settings:

**Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Netlify:**
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Deploy via Docker

### Dockerfile sugerido

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

### Build e execução

```bash
docker build -t cadastro-clientes .
docker run -p 3000:3000 -e VITE_SUPABASE_URL=... -e VITE_SUPABASE_ANON_KEY=... cadastro-clientes
```

## Variáveis de Ambiente

### Obrigatórias
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

### Opcionais
- `VITE_CPF_LOOKUP_PROVIDER` (`mock`, `assertiva`, `serasa`, `bigdatacorp`)
- `VITE_CPF_LOOKUP_API_KEY`

## Checklist de Deploy

- [ ] Testes passando (`npm test`)
- [ ] Build local funcionando (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Tabelas criadas no Supabase
- [ ] RLS policies aplicadas
- [ ] Deploy configurado no provedor

## Monitoramento e logs

**Vercel:**
- Dashboard → Deployments → Logs

**Netlify:**
- Site settings → Deploy & Manage → Logs

**Supabase:**
- Dashboard → Logs

## Rollback

**Vercel:**
- Dashboard → Deployments → selecionar versão anterior → **Promote to Production**

**Netlify:**
- Deploys → selecionar deploy anterior → **Publish deploy**

## Performance

- Use PageSpeed Insights: https://pagespeed.web.dev/
- Ative caching no provedor
- Aproveite code splitting do Vite
- Comprimir assets se necessário

## Suporte

1. Verifique console do navegador
2. Verifique logs de build
3. Confirme variáveis de ambiente
4. Valide schemas no Supabase

## Observações

- O projeto já possui navegação por rotas no frontend
- Use URLs diretas para acessar páginas específicas
- Mantenha `package-lock.json` sincronizado ao instalar dependências

