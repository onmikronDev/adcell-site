/// <reference path="../pb_data/types.d.ts" />
// Adiciona campo de arquivo para a foto enviada do PC.
// O campo photo continua como texto para URLs externas.
migrate((app) => {
  const products = app.findCollectionByNameOrId('inventory_products');
  if (!products.fields.getByName('photo_file')) {
    products.fields.add(new FileField({ name: 'photo_file', maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }));
    app.save(products);
  }
}, (app) => {});
