/// <reference path="../pb_data/types.d.ts" />
// Colecao para fotos enviadas pelo painel + regras mais restritas.
migrate((app) => {
  const staff = "@request.auth.role = 'admin' || @request.auth.role = 'technician'";
  const adminOnly = "@request.auth.role = 'admin'";

  try {
    app.findCollectionByNameOrId('product_photos');
  } catch (_) {
    app.save(new Collection({
      name: 'product_photos',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: staff,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'photo', type: 'file', required: true, maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    }));
  }

  const products = app.findCollectionByNameOrId('inventory_products');
  products.listRule = '';
  products.viewRule = '';
  products.createRule = adminOnly;
  products.updateRule = staff;
  products.deleteRule = adminOnly;
  app.save(products);

  const orders = app.findCollectionByNameOrId('service_orders');
  orders.createRule = '';
  orders.listRule = staff;
  orders.viewRule = staff;
  orders.updateRule = staff;
  orders.deleteRule = adminOnly;
  app.save(orders);
}, (app) => {});
