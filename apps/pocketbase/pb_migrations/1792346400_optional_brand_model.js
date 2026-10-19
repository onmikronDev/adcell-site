/// <reference path="../pb_data/types.d.ts" />
// Marca e modelo deixam de ser obrigatorios.
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  for (const name of ['brand', 'model']) {
    const field = products.fields.getByName(name);
    if (field) {
      field.required = false;
    }
  }
  app.save(products);
}, (app) => {});
