# ADCELL CASE

Site de vendas e assistência técnica de celulares, com catálogo, carrinho, consulta de O.S. e painel administrativo.

## Como rodar no PC

1. Instale o Node.js LTS.
2. `npm run setup` para instalar as dependências.
3. Instale o PocketBase e coloque o executável no PATH.
4. Defina as variáveis do superusuário:

```bash
export PB_SUPERUSER_EMAIL="seu@email.com"
export PB_SUPERUSER_PASSWORD="SuaSenhaForte123"
```

5. `npm run dev`
6. Abra `http://localhost:3000`. O PocketBase fica em `http://localhost:8090` e o painel dele em `http://localhost:8090/_/`.

## Scripts

- `npm run dev`: site + PocketBase em desenvolvimento.
- `npm run build`: build do site.
- `npm run start`: roda o build.
- `npm run lint`: verifica o código.
- `npm run typecheck`: checa tipos TypeScript.

## Estrutura

- `apps/web`: site em React Router + Vite.
- `apps/pocketbase`: banco de dados, migrações e dados locais.
