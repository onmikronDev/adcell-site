<?php
declare(strict_types=1);
require __DIR__ . '/../config.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = db()->prepare('SELECT * FROM admin_users WHERE email = ?');
    $stmt->execute([trim($_POST['email'] ?? '')]);
    $user = $stmt->fetch();
    if ($user && password_verify($_POST['password'] ?? '', $user['password_hash'])) {
        session_start();
        $_SESSION['admin_id'] = $user['id'];
        header('Location: index.php');
        exit;
    }
    $error = 'E-mail ou senha inválidos.';
}
?>
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Admin — ADCELL CASE</title><link rel="stylesheet" href="../assets/style.css"></head><body>
<main class="container">
<h1>Painel ADCELL</h1>
<?php if ($error): ?><p class="alert"><?= e($error) ?></p><?php endif; ?>
<form method="post" class="form">
  <label>E-mail<input type="email" name="email" required></label>
  <label>Senha<input type="password" name="password" required></label>
  <button class="button" type="submit">Entrar</button>
</form>
</main></body></html>
