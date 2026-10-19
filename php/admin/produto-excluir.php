<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
require __DIR__ . '/auth.php';

db()->prepare('DELETE FROM products WHERE id = ?')->execute([(int) ($_GET['id'] ?? 0)]);
header('Location: index.php');
