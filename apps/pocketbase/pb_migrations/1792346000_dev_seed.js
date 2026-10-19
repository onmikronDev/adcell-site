/// <reference path="../pb_data/types.d.ts" />
// SEED DE DESENVOLVIMENTO: login admin / admin e produtos de exemplo.
// Nao roda quando ADCELL_PRODUCTION=1. Remova este arquivo antes de publicar.
migrate((app) => {
  if ($os.getenv('ADCELL_PRODUCTION') === '1') return;

  const users = app.findCollectionByNameOrId('users');
  const pw = users.fields.getByName('password');
  if (pw && pw.min > 5) {
    pw.min = 5;
    app.save(users);
  }

  let admin;
  try {
    admin = app.findAuthRecordByEmail('users', 'admin@adcellcase.com');
  } catch (_) {
    admin = new Record(users);
    admin.setEmail('admin@adcellcase.com');
    admin.set('name', 'ADCELL CASE');
    admin.set('role', 'admin');
    admin.set('verified', true);
  }
  admin.setPassword('admin');
  app.save(admin);

  const products = app.findCollectionByNameOrId('inventory_products');
  const items = [
    ['capinhas', 'Capinha Silicone Premium', 'Samsung', 'Galaxy A15', 'Preto', 39.9, 12, 'CAP-SAM-A15-PT', 30, ''],
    ['capinhas', 'Capinha Anti-Impacto Transparente', 'Apple', 'iPhone 13', 'Transparente', 49.9, 15, 'CAP-APL-13-TR', 25, ''],
    ['capinhas', 'Capinha Anti-Impacto Reforçada', 'Motorola', 'Moto G54', 'Azul', 44.9, 14, 'CAP-MOT-G54-AZ', 18, ''],
    ['capinhas', 'Capinha Silicone Soft', 'Xiaomi', 'Redmi Note 13', 'Verde', 39.9, 11, 'CAP-XIA-RN13-VD', 20, ''],
    ['peliculas', 'Película de Vidro 3D', 'Samsung', 'Galaxy A15', 'Transparente', 29.9, 6, 'PEL-SAM-A15-VD', 40, 'Vidro'],
    ['peliculas', 'Película Privacidade', 'Apple', 'iPhone 13', 'Preto', 34.9, 8, 'PEL-APL-13-PV', 22, 'Privacidade'],
    ['peliculas', 'Película Hidrogel', 'Motorola', 'Moto G54', 'Transparente', 24.9, 5, 'PEL-MOT-G54-HG', 35, 'Hidrogel'],
    ['peliculas', 'Película Fosca Gamer', 'Xiaomi', 'Redmi Note 13', 'Transparente', 27.9, 6, 'PEL-XIA-RN13-FS', 28, 'Fosca'],
    ['carregadores', 'Carregador Turbo 20W USB-C', 'Universal', 'USB-C', 'Branco', 59.9, 28, 'CAR-UNI-20W', 50, ''],
    ['carregadores', 'Cabo USB-C 1m Reforçado', 'Universal', 'USB-C', 'Preto', 24.9, 8, 'CAB-UNI-USBC-1M', 60, ''],
    ['fones', 'Fone de Ouvido Bluetooth', 'Universal', 'Bluetooth 5.3', 'Preto', 89.9, 45, 'FON-UNI-BT53', 15, ''],
    ['caixas-de-som', 'Caixa de Som Bluetooth Portátil', 'Universal', 'Bluetooth', 'Verde', 119.9, 70, 'CXS-UNI-BT', 10, ''],
  ];
  for (const [slug, title, brand, model, color, price, cost, sku, stock, film] of items) {
    if (app.findRecordsByFilter('inventory_products', `sku = '${sku}'`).length) continue;
    const cat = app.findRecordsByFilter('categories', `slug = '${slug}'`);
    if (!cat.length) continue;
    const row = new Record(products);
    row.set('category', [cat[0].id]);
    row.set('title', title);
    row.set('brand', brand);
    row.set('model', model);
    row.set('color', color);
    row.set('sale_price', price);
    row.set('cost_price', cost);
    row.set('sku', sku);
    row.set('stock', stock);
    row.set('min_stock', 5);
    if (film) row.set('film_type', film);
    row.set('description', 'Produto de exemplo para testes.');
    row.set('active', true);
    app.save(row);
  }

  const technicians = app.findCollectionByNameOrId('technicians');
  for (const name of ['Carlos', 'Marina']) {
    if (app.findRecordsByFilter('technicians', `name = '${name}'`).length) continue;
    const row = new Record(technicians);
    row.set('name', name);
    row.set('active', true);
    app.save(row);
  }

  const testimonials = app.findCollectionByNameOrId('testimonials');
  const reviews = [
    ['Juliana S.', 'Atendimento rápido e a película ficou perfeita.', 5],
    ['Rafael M.', 'Troquei a tela do meu celular no mesmo dia. Recomendo!', 5],
    ['Camila P.', 'Ótimos preços em capinhas e carregadores.', 4],
  ];
  for (const [name, text, rating] of reviews) {
    if (app.findRecordsByFilter('testimonials', `name = '${name}'`).length) continue;
    const row = new Record(testimonials);
    row.set('name', name);
    row.set('text', text);
    row.set('rating', rating);
    row.set('published', true);
    app.save(row);
  }
}, (app) => {});
