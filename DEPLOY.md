# Deploy na Hostinger (Node.js Hosting)

## Configuração do hPanel

| Campo | Valor |
|---|---|
| Application type | `react-router` |
| Build command | `npm run build` |
| Output directory | `dist/apps/web` |
| Entry file | `server/index.js` |
| Node version | 20 ou 22 |

> O build gera os bundles em `dist/apps/web/client` e `dist/apps/web/server`.
> O entry file é relativo ao output directory.

## Variáveis de ambiente

Adicione no hPanel (Environment Variables):

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha
DB_NAME=adcell
```

## Banco de dados

1. Crie o banco `adcell` no phpMyAdmin.
2. Importe/execute o arquivo `database.sql`.

## Deploy

1. Conecte o repositório GitHub em Node.js Hosting.
2. A cada push na `main`, a Hostinger roda `npm run build` e inicia `server/index.js`.
