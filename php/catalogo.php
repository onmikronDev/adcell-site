<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/includes/header.php';

$slug = $_GET['categoria'] ?? '';
$sql = 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.active = 1';
$params = [];
if ($slug !== '') {
    $sql .= ' AND c.slug = ?';
    $params[] = $slug;
}
$sql .= ' ORDER BY p.created_at DESC';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();
$categories = db()->query('SELECT * FROM categories WHERE active = 1 ORDER BY name')->fetchAll();
?>
<h1>Catálogo</h1>
<p>
  <a class="button secondary" href="catalogo.php">Todos</a>
  <?php foreach ($categories as $category): ?>
    <a class="button secondary" href="catalogo.php?categoria=<?= e($category['slug']) ?>"><?= e($category['name']) ?></a>
  <?php endforeach; ?>
</p>
<div class="grid">
<?php foreach ($products as $product): ?>
  <article class="card">
    <a href="produto.php?id=<?= (int) $product['id'] ?>">
      <?php if ($product['photo']): ?><img src="uploads/<?= e($product['photo']) ?>" alt="<?= e($product['title']) ?>"><?php endif; ?>
    </a>
    <div class="body">
      <h3><a href="produto.php?id=<?= (int) $product['id'] ?>"><?= e($product['title']) ?></a></h3>
      <p class="muted"><?= e($product['brand']) ?> <?= e($product['model']) ?></p>
      <p class="price"><?= money((int) $product['sale_price']) ?></p>
      <?php if ((int) $product['stock'] <= 0): ?><p class="muted">Esgotado</p><?php endif; ?>
    </div>
  </article>
<?php endforeach; ?>
</div>
<?php require __DIR__ . '/includes/footer.php';
