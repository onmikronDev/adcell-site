/// <reference path="../pb_data/types.d.ts" />
// SKU deixa de ser obrigatorio e remove o indice unico que impedia SKU vazio duplicado.
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  const sku = products.fields.getByName('sku');
  if (sku) {
    sku.required = false;
    app.save(products);
  }
  try {
    products.indexes = products.indexes.filter(index => !index.includes('idx_inventory_sku'));
    app.save(products);
  } catch (_) {}
}, (app) => {});
