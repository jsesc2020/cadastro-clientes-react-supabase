# Cadastro de Clientes (React + Tailwind + Supabase)

Este projeto é um scaffold mínimo contendo o componente de Cadastro de Clientes com:
- Escolha CPF / CNPJ com máscara
- Consulta BrasilAPI para CNPJ
- Consulta ViaCEP para CEP
- Validação matemática de CPF
- Integração com Supabase (checagem de duplicidade e inserção)

Setup rápido:

```bash
npm install
# coloque as variáveis em .env
npm run dev
```

Variáveis de ambiente (exemplo em `.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

Crie a tabela `clientes` no Supabase com colunas mínimas: `id (pk)`, `tipo`, `cpf_cnpj`, `razao_nome`, `fantasia_apelido`, `inscricao_estadual`, `email`, `telefone`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`.
