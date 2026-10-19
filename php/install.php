<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$pdo = db();
$pdo->exec("CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    kind VARCHAR(20) NOT NULL DEFAULT 'outro',
    active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    brand VARCHAR(60) NULL,
    model VARCHAR(80) NULL,
    color VARCHAR(40) NULL,
    sku VARCHAR(40) NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 1,
    sale_price INT NOT NULL DEFAULT 0,
    cost_price INT NOT NULL DEFAULT 0,
    photo VARCHAR(255) NULL,
    description TEXT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$categories = [
    ['Capinhas', 'capinhas', 'capinha'],
    ['Películas', 'peliculas', 'pelicula'],
    ['Carregadores', 'carregadores', 'outro'],
    ['Fones de ouvido', 'fones', 'outro'],
    ['Caixas de som', 'caixas-de-som', 'outro'],
];
$stmt = $pdo->prepare('INSERT IGNORE INTO categories (name, slug, kind) VALUES (?, ?, ?)');
foreach ($categories as [$name, $slug, $kind]) {
    $stmt->execute([$name, $slug, $kind]);
}

$exists = $pdo->prepare('SELECT id FROM admin_users WHERE email = ?');
$exists->execute([ADMIN_EMAIL]);
if (!$exists->fetch()) {
    $pdo->prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)')
        ->execute([ADMIN_EMAIL, password_hash(ADMIN_PASSWORD, PASSWORD_DEFAULT)]);
}

echo '<h1>Instalação concluída</h1><p><a href="admin/">Abrir painel</a></p><p><strong>Apague este arquivo install.php do servidor agora.</strong></p>';
