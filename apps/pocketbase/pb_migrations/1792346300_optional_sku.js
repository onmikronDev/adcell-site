/// <reference path="../pb_data/types.d.ts" />
// SKU deixa de ser obrigatorio.
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  const sku = products.fields.getByName('sku');
  if (sku) {
    sku.required = false;
    app.save(products);
  }
}, (app) => {});
