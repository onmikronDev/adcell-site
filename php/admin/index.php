<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';
require __DIR__ . '/auth.php';

$products = db()->query('SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.created_at DESC')->fetchAll();
?>
<h1>Produtos</h1>
<p><a class="button" href="produto-form.php">Cadastrar produto</a></p>
<table>
<tr><th>Foto</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th></th></tr>
<?php foreach ($products as $product): ?>
<tr>
  <td><?php if ($product['photo']): ?><img src="../uploads/<?= e($product['photo']) ?>" width="60" alt=""><?php endif; ?></td>
  <td><?= e($product['title']) ?></td>
  <td><?= e($product['category_name']) ?></td>
  <td><?= money((int) $product['sale_price']) ?></td>
  <td><?= (int) $product['stock'] ?></td>
  <td>
    <a href="produto-form.php?id=<?= (int) $product['id'] ?>">Editar</a>
    <a href="produto-excluir.php?id=<?= (int) $product['id'] ?>" onclick="return confirm('Excluir este produto?')">Excluir</a>
  </td>
</tr>
<?php endforeach; ?>
</table>
