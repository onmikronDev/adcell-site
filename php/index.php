<?php
declare(strict_types=1);
require __DIR__ . '/config.php';
require __DIR__ . '/includes/header.php';

$categories = db()->query('SELECT * FROM categories WHERE active = 1 ORDER BY name')->fetchAll();
$products = db()->query('SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.active = 1 ORDER BY p.created_at DESC LIMIT 8')->fetchAll();
?>
<section class="hero">
  <h1>Acessórios e assistência técnica</h1>
  <p>Capinhas, películas, carregadores e muito mais para o seu celular.</p>
  <a class="button" href="catalogo.php">Ver catálogo</a>
</section>

<h2>Categorias</h2>
<div class="grid">
<?php foreach ($categories as $category): ?>
  <a class="card" href="catalogo.php?categoria=<?= e($category['slug']) ?>">
    <div class="body"><h3><?= e($category['name']) ?></h3><p class="muted">Ver produtos</p></div>
  </a>
<?php endforeach; ?>
</div>

<h2>Novidades</h2>
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
    </div>
  </article>
<?php endforeach; ?>
</div>
<?php require __DIR__ . '/includes/footer.php';
