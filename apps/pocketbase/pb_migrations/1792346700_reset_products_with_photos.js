/// <reference path="../pb_data/types.d.ts" />
// Apaga todos os produtos e cadastra novos itens com foto (URL).
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  const categories = app.findCollectionByNameOrId('categories');
  for (const record of app.findRecordsByFilter('inventory_products', 'id != ""')) {
    app.delete(record);
  }
  const byslug = (slug) => app.findRecordsByFilter('categories', `slug = '${slug}'`)[0];
  const capinhas = byslug('capinhas');
  const peliculas = byslug('peliculas');
  const carregadores = byslug('carregadores');
  const fones = byslug('fones');
  const caixas = byslug('caixas-de-som');
  const items = [
    { title: 'Capinha Samsung Galaxy A15 Transparente', brand: 'Samsung', model: 'Galaxy A15', category: capinhas, photo: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80', price: 2990, cost: 1200, stock: 12 },
    { title: 'Capinha iPhone 15 Silicone Preto', brand: 'Apple', model: 'iPhone 15', category: capinhas, photo: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=800&q=80', price: 4990, cost: 2200, stock: 8 },
    { title: 'Película de Vidro Samsung Galaxy A15', brand: 'Samsung', model: 'Galaxy A15', category: peliculas, photo: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80', price: 1990, cost: 600, stock: 25 },
    { title: 'Carregador Turbo 25W USB-C', brand: 'Samsung', model: '25W', category: carregadores, photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', price: 6990, cost: 3200, stock: 10 },
    { title: 'Fone Bluetooth TWS Preto', brand: 'Xiaomi', model: 'TWS', category: fones, photo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', price: 8990, cost: 4200, stock: 6 },
    { title: 'Caixa de Som Bluetooth Portátil', brand: 'JBL', model: 'Go 3', category: caixas, photo: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80', price: 19990, cost: 11000, stock: 4 },
  ];
  for (const item of items) {
    if (!item.category) continue;
    const row = new Record(products);
    row.set('title', item.title);
    row.set('brand', item.brand);
    row.set('model', item.model);
    row.set('photo', item.photo);
    row.set('sale_price', item.price);
    row.set('cost_price', item.cost);
    row.set('sku', '');
    row.set('stock', item.stock);
    row.set('min_stock', 2);
    row.set('category', [item.category.id]);
    row.set('active', true);
    app.save(row);
  }
}, (app) => {});
