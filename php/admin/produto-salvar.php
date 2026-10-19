<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
require __DIR__ . '/auth.php';

$id = (int) ($_POST['id'] ?? 0);
$photo = null;

if (!empty($_FILES['photo']['name'])) {
    $file = $_FILES['photo'];
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($allowed[$file['type']]) || $file['size'] > 5 * 1024 * 1024) {
        die('Use uma foto JPG, PNG ou WebP de até 5 MB.');
    }
    $extension = $allowed[$file['type']];
    $photo = bin2hex(random_bytes(8)) . '.' . $extension;
    if (!is_dir(__DIR__ . '/../uploads')) {
        mkdir(__DIR__ . '/../uploads', 0755, true);
    }
    move_uploaded_file($file['tmp_name'], __DIR__ . '/../uploads/' . $photo);
}

$data = [
    'category_id' => (int) $_POST['category_id'],
    'title' => trim($_POST['title']),
    'brand' => trim($_POST['brand'] ?? ''),
    'model' => trim($_POST['model'] ?? ''),
    'color' => trim($_POST['color'] ?? ''),
    'sku' => trim($_POST['sku'] ?? ''),
    'stock' => (int) $_POST['stock'],
    'sale_price' => (int) round(((float) $_POST['sale_price']) * 100),
    'cost_price' => (int) round(((float) ($_POST['cost_price'] ?? 0)) * 100),
    'description' => trim($_POST['description'] ?? ''),
];

if ($photo) {
    $data['photo'] = $photo;
}

if ($id) {
    $sets = implode(', ', array_map(fn($key) => "$key = :$key", array_keys($data)));
    $data['id'] = $id;
    db()->prepare("UPDATE products SET $sets WHERE id = :id")->execute($data);
} else {
    $columns = implode(', ', array_keys($data));
    $placeholders = implode(', ', array_map(fn($key) => ":$key", array_keys($data)));
    db()->prepare("INSERT INTO products ($columns) VALUES ($placeholders)")->execute($data);
}

header('Location: index.php');
