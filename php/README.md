# ADCELL CASE — versão PHP + MySQL

Versão compatível com hospedagem compartilhada da Hostinger.

## 1. Criar o banco

No hPanel: **Bancos de Dados MySQL** → crie um banco e um usuário.
Anote: host (geralmente localhost), nome do banco, usuário e senha.

## 2. Configurar

Edite `php/config.php` e preencha:

- DB_HOST (normalmente localhost)
- DB_NAME
- DB_USER
- DB_PASS
- ADMIN_EMAIL e ADMIN_PASSWORD (login do painel)

## 3. Instalar

Suba a pasta `php/` para `public_html`.

Acesse uma vez:

https://adcell.com.br/install.php

Isso cria as tabelas e o usuário admin. Depois **apague o install.php** do servidor.

## 4. Usar

- Site: https://adcell.com.br/
- Catálogo: https://adcell.com.br/catalogo.php
- Admin: https://adcell.com.br/admin/

As fotos enviadas no admin ficam em `php/uploads/`.
