<?php
declare(strict_types=1);

// ===== CONFIGURE AQUI =====
const DB_HOST = 'localhost';
const DB_NAME = 'adcell';
const DB_USER = 'usuario_do_banco';
const DB_PASS = 'senha_do_banco';

const ADMIN_EMAIL = 'admin@adcell.com.br';
const ADMIN_PASSWORD = 'TroqueEstaSenha123';
const WHATSAPP = '5511999999999';
// ==========================

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function money(int $cents): string {
    return 'R$ ' . number_format($cents / 100, 2, ',', '.');
}

function e(?string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
