<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
require __DIR__ . '/auth.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$product = null;
if ($id) {
    $stmt = db()->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
}
$categories = db()->query('SELECT * FROM categories WHERE active = 1 ORDER BY name')->fetchAll();
?>
<h1><?= $id ? 'Editar produto' : 'Cadastrar produto' ?></h1>
<form method="post" action="produto-salvar.php" enctype="multipart/form-data" class="form">
  <input type="hidden" name="id" value="<?= $id ?>">
  <label>Categoria
    <select name="category_id" required>
      <?php foreach ($categories as $category): ?>
        <option value="<?= (int) $category['id'] ?>" <?= $product && (int) $product['category_id'] === (int) $category['id'] ? 'selected' : '' ?>><?= e($category['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <label>Nome<input name="title" required value="<?= e($product['title'] ?? '') ?>"></label>
  <label>Marca (opcional)<input name="brand" value="<?= e($product['brand'] ?? '') ?>"></label>
  <label>Modelo (opcional)<input name="model" value="<?= e($product['model'] ?? '') ?>"></label>
  <label>Cor (opcional)<input name="color" value="<?= e($product['color'] ?? '') ?>"></label>
  <label>SKU (opcional)<input name="sku" value="<?= e($product['sku'] ?? '') ?>"></label>
  <label>Foto do produto (do PC)<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
  <?php if (!empty($product['photo'])): ?><img src="../uploads/<?= e($product['photo']) ?>" width="120" alt=""><?php endif; ?>
  <label>Preço de venda (R$)<input type="number" step="0.01" min="0" name="sale_price" required value="<?= e(isset($product['sale_price']) ? number_format($product['sale_price'] / 100, 2, '.', '') : '') ?>"></label>
  <label>Preço de custo (R$)<input type="number" step="0.01" min="0" name="cost_price" value="<?= e(isset($product['cost_price']) ? number_format($product['cost_price'] / 100, 2, '.', '') : '') ?>"></label>
  <label>Estoque<input type="number" min="0" name="stock" required value="<?= e($product['stock'] ?? '0') ?>"></label>
  <label>Descrição<textarea name="description" rows="3"><?= e($product['description'] ?? '') ?></textarea></label>
  <button class="button" type="submit">Salvar</button>
</form>
