/// <reference path="../pb_data/types.d.ts" />
// SEED DE DESENVOLVIMENTO: mais produtos de exemplo.
migrate((app) => {
  if ($os.getenv('ADCELL_PRODUCTION') === '1') return;

  const products = app.findCollectionByNameOrId('inventory_products');
  const items = [
    ['capinhas', 'Capinha Transparente Anti-Amarelecimento', 'Samsung', 'Galaxy S23', 'Transparente', 49.9, 16, 'CAP-SAM-S23-TR', 24, ''],
    ['capinhas', 'Capinha MagSafe Premium', 'Apple', 'iPhone 14', 'Preto', 89.9, 32, 'CAP-APL-14-MG', 18, ''],
    ['capinhas', 'Capinha Carteira com Suporte', 'Motorola', 'Moto G84', 'Marrom', 59.9, 20, 'CAP-MOT-G84-CT', 15, ''],
    ['capinhas', 'Capinha Silicone Touch', 'Xiaomi', 'Redmi 12', 'Rosa', 34.9, 10, 'CAP-XIA-R12-RS', 30, ''],
    ['peliculas', 'Película de Vidro Temperado 9H', 'Samsung', 'Galaxy S23', 'Transparente', 34.9, 7, 'PEL-SAM-S23-9H', 45, 'Vidro'],
    ['peliculas', 'Película Cerâmica Flexível', 'Apple', 'iPhone 14', 'Transparente', 44.9, 12, 'PEL-APL-14-CR', 25, 'Outro'],
    ['peliculas', 'Película Antirreflexo', 'Motorola', 'Moto G84', 'Transparente', 29.9, 8, 'PEL-MOT-G84-AR', 35, 'Fosca'],
    ['carregadores', 'Carregador Rápido 33W USB-C', 'Universal', 'USB-C', 'Preto', 79.9, 35, 'CAR-UNI-33W', 28, ''],
    ['carregadores', 'Carregador Sem Fio 15W', 'Universal', 'Qi', 'Branco', 99.9, 48, 'CAR-UNI-QI15', 12, ''],
    ['carregadores', 'Cabo USB-C para Lightning 2m', 'Universal', 'USB-C / Lightning', 'Branco', 39.9, 14, 'CAB-UNI-LTN-2M', 40, ''],
    ['fones', 'Fone TWS com Cancelamento de Ruído', 'Universal', 'Bluetooth 5.3', 'Preto', 149.9, 75, 'FON-UNI-TWS-ANC', 14, ''],
    ['fones', 'Fone Gamer com Microfone', 'Universal', 'USB / P2', 'Preto e Verde', 129.9, 60, 'FON-UNI-GMR', 10, ''],
    ['caixas-de-som', 'Caixa de Som à Prova de Água', 'Universal', 'Bluetooth', 'Preto', 189.9, 95, 'CXS-UNI-IPX7', 8, ''],
    ['caixas-de-som', 'Caixa de Som Compacta 10W', 'Universal', 'Bluetooth', 'Verde', 89.9, 42, 'CXS-UNI-10W', 20, ''],
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
}, (app) => {});
