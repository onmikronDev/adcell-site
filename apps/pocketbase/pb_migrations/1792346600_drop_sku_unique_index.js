/// <reference path="../pb_data/types.d.ts" />
// Remove qualquer indice unico que envolva o campo sku.
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  const before = products.indexes || [];
  const kept = before.filter(index => !/\bsku\b/i.test(index));
  if (kept.length !== before.length) {
    products.indexes = kept;
    app.save(products);
  }
}, (app) => {});
