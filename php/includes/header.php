<?php
$siteTitle = $siteTitle ?? 'ADCELL CASE';
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($siteTitle) ?> — ADCELL CASE</title>
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<header class="site-header">
  <a class="logo" href="index.php">ADCELL CASE</a>
  <nav>
    <a href="index.php">Início</a>
    <a href="catalogo.php">Catálogo</a>
    <a href="admin/">Admin</a>
  </nav>
</header>
<main class="container">
