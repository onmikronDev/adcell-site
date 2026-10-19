<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/includes/header.php';

$stmt = db()->prepare('SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ? AND p.active = 1');
$stmt->execute([$_GET['id'] ?? 0]);
$product = $stmt->fetch();
if (!$product) {
    echo '<h1>Produto não encontrado</h1>';
    require __DIR__ . '/includes/footer.php';
    exit;
}
?>
<div class="grid">
  <div class="card">
    <?php if ($product['photo']): ?><img src="uploads/<?= e($product['photo']) ?>" alt="<?= e($product['title']) ?>"><?php endif; ?>
  </div>
  <div class="card"><div class="body">
    <h1><?= e($product['title']) ?></h1>
    <p class="muted"><?= e($product['category_name']) ?> · <?= e($product['brand']) ?> <?= e($product['model']) ?> <?= e($product['color']) ?></p>
    <p class="price"><?= money((int) $product['sale_price']) ?></p>
    <p><?= nl2br(e($product['description'])) ?></p>
    <a class="button" href="https://wa.me/<?= e(WHATSAPP) ?>?text=<?= urlencode('Quero reservar ' . $product['title']) ?>">Reservar no WhatsApp</a>
  </div></div>
</div>
<?php require __DIR__ . '/includes/footer.php';
