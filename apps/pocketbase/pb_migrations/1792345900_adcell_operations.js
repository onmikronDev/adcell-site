/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          required: true,
          maxSelect: 1,
          values: ['admin', 'technician'],
        }),
      );
    }
    users.createRule = null;
    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
    users.updateRule =
      "(id = @request.auth.id && @request.body.role:changed = false) || @request.auth.role = 'admin'";
    users.deleteRule = "@request.auth.role = 'admin' && id != @request.auth.id";
    app.save(users);

    const existingAdmin = app.findRecordsByFilter('users', "email = 'admin@adcellcase.com'");
    if (!existingAdmin.length) {
      const admin = new Record(users);
      admin.set('id', 'adcelladmin0001');
      admin.setEmail('admin@adcellcase.com');
      admin.setPassword('K7m#AdCell26x');
      admin.set('name', 'ADCELL CASE');
      admin.set('role', 'admin');
      admin.set('verified', true);
      app.save(admin);
    }

    const staff = "@request.auth.role = 'admin' || @request.auth.role = 'technician'";
    const adminOnly = "@request.auth.role = 'admin'";

    let categories;
    try {
      categories = app.findCollectionByNameOrId('categories');
    } catch (_) {
      categories = new Collection({
        name: 'categories',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: adminOnly,
        updateRule: adminOnly,
        deleteRule: adminOnly,
        fields: [
          { name: 'name', type: 'text', required: true, max: 80 },
          { name: 'slug', type: 'text', required: true, max: 80 },
          { name: 'kind', type: 'select', required: true, maxSelect: 1, values: ['capinha', 'pelicula', 'outro'] },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
      });
      app.save(categories);
    }

    let products;
    try {
      products = app.findCollectionByNameOrId('inventory_products');
    } catch (_) {
      products = new Collection({
        name: 'inventory_products',
        type: 'base',
        listRule: staff,
        viewRule: staff,
        createRule: adminOnly,
        updateRule: staff,
        deleteRule: adminOnly,
        fields: [
          { name: 'category', type: 'relation', required: true, maxSelect: 8, collectionId: categories.id },
          { name: 'title', type: 'text', required: true, max: 160 },
          { name: 'brand', type: 'text', required: true, max: 60 },
          { name: 'model', type: 'text', required: true, max: 80 },
          { name: 'color', type: 'text', max: 40 },
          { name: 'photo', type: 'text', max: 500 },
          { name: 'sale_price', type: 'number', required: true, min: 0 },
          { name: 'cost_price', type: 'number', min: 0 },
          { name: 'sku', type: 'text', required: true, max: 40 },
          { name: 'stock', type: 'number', min: 0 },
          { name: 'min_stock', type: 'number', min: 0 },
          { name: 'film_type', type: 'select', maxSelect: 1, values: ['Privacidade', 'Fosca', 'Vidro', 'Hidrogel', 'Outro'] },
          { name: 'description', type: 'text', max: 4000 },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_inventory_sku ON inventory_products (sku)"],
      });
      app.save(products);
    }

    let technicians;
    try {
      technicians = app.findCollectionByNameOrId('technicians');
    } catch (_) {
      technicians = new Collection({
        name: 'technicians',
        type: 'base',
        listRule: staff,
        viewRule: staff,
        createRule: adminOnly,
        updateRule: adminOnly,
        deleteRule: adminOnly,
        fields: [
          { name: 'name', type: 'text', required: true, max: 80 },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      app.save(technicians);
    }

    let orders;
    try {
      orders = app.findCollectionByNameOrId('service_orders');
    } catch (_) {
      orders = new Collection({
        name: 'service_orders',
        type: 'base',
        listRule: staff,
        viewRule: staff,
        createRule: staff,
        updateRule: staff,
        deleteRule: adminOnly,
        fields: [
          { name: 'os_number', type: 'text', required: true, max: 20 },
          { name: 'customer_name', type: 'text', required: true, max: 120 },
          { name: 'cpf', type: 'text', max: 14 },
          { name: 'whatsapp', type: 'text', required: true, max: 20 },
          { name: 'email', type: 'email' },
          { name: 'brand', type: 'text', required: true, max: 60 },
          { name: 'model', type: 'text', required: true, max: 80 },
          { name: 'imei', type: 'text', max: 20 },
          { name: 'problem', type: 'text', required: true, max: 4000 },
          { name: 'checklist', type: 'json' },
          { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['em_analise', 'aguardando_peca', 'em_reparo', 'pronto', 'entregue'] },
          { name: 'technician', type: 'relation', maxSelect: 1, collectionId: technicians.id },
          { name: 'public_note', type: 'text', max: 500 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE UNIQUE INDEX idx_os_number ON service_orders (os_number)"],
      });
      app.save(orders);
    }

    try {
      app.findCollectionByNameOrId('os_events');
    } catch (_) {
      app.save(new Collection({
        name: 'os_events',
        type: 'base',
        listRule: staff,
        viewRule: staff,
        createRule: staff,
        updateRule: null,
        deleteRule: adminOnly,
        fields: [
          { name: 'order', type: 'relation', required: true, maxSelect: 1, collectionId: orders.id, cascadeDelete: true },
          { name: 'status', type: 'text', required: true, max: 40 },
          { name: 'note', type: 'text', max: 2000 },
          { name: 'parts', type: 'text', max: 500 },
          { name: 'author', type: 'text', max: 80 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }));
    }

    try {
      app.findCollectionByNameOrId('problem_reports');
    } catch (_) {
      app.save(new Collection({
        name: 'problem_reports',
        type: 'base',
        listRule: staff,
        viewRule: staff,
        createRule: '',
        updateRule: staff,
        deleteRule: adminOnly,
        fields: [
          { name: 'name', type: 'text', required: true, min: 3, max: 120 },
          { name: 'whatsapp', type: 'text', required: true, max: 20 },
          { name: 'email', type: 'email', required: true },
          { name: 'brand', type: 'text', required: true, max: 60 },
          { name: 'model', type: 'text', required: true, max: 80 },
          { name: 'problem', type: 'text', required: true, min: 10, max: 4000 },
          { name: 'status', type: 'select', maxSelect: 1, values: ['novo', 'em_atendimento', 'encerrado'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }));
    }

    let sales;
    try {
      sales = app.findCollectionByNameOrId('counter_sales');
    } catch (_) {
      sales = new Collection({
        name: 'counter_sales',
        type: 'base',
        listRule: adminOnly,
        viewRule: adminOnly,
        createRule: staff,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'payment', type: 'select', required: true, maxSelect: 1, values: ['pix', 'credito', 'debito', 'dinheiro'] },
          { name: 'total', type: 'number', required: true, min: 0 },
          { name: 'cost_total', type: 'number', min: 0 },
          { name: 'note', type: 'text', max: 200 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      app.save(sales);
    }

    try {
      app.findCollectionByNameOrId('sale_items');
    } catch (_) {
      app.save(new Collection({
        name: 'sale_items',
        type: 'base',
        listRule: adminOnly,
        viewRule: adminOnly,
        createRule: staff,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'sale', type: 'relation', required: true, maxSelect: 1, collectionId: sales.id, cascadeDelete: true },
          { name: 'product', type: 'relation', maxSelect: 1, collectionId: products.id },
          { name: 'title', type: 'text', required: true, max: 160 },
          { name: 'category_name', type: 'text', max: 80 },
          { name: 'quantity', type: 'number', required: true, min: 1 },
          { name: 'unit_price', type: 'number', required: true, min: 0 },
          { name: 'unit_cost', type: 'number', min: 0 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }));
    }

    try {
      app.findCollectionByNameOrId('testimonials');
    } catch (_) {
      app.save(new Collection({
        name: 'testimonials',
        type: 'base',
        listRule: "published = true || @request.auth.role = 'admin'",
        viewRule: "published = true || @request.auth.role = 'admin'",
        createRule: adminOnly,
        updateRule: adminOnly,
        deleteRule: adminOnly,
        fields: [
          { name: 'name', type: 'text', required: true, max: 80 },
          { name: 'text', type: 'text', required: true, max: 600 },
          { name: 'rating', type: 'number', min: 1, max: 5 },
          { name: 'published', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }));
    }

    try {
      app.findCollectionByNameOrId('store_settings');
    } catch (_) {
      const settings = new Collection({
        name: 'store_settings',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: adminOnly,
        updateRule: adminOnly,
        deleteRule: null,
        fields: [
          { name: 'whatsapp', type: 'text', max: 20 },
          { name: 'instagram', type: 'url' },
          { name: 'facebook', type: 'url' },
          { name: 'address', type: 'text', max: 240 },
          { name: 'maps_url', type: 'url' },
          { name: 'hours', type: 'text', max: 240 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      app.save(settings);
      const row = new Record(settings);
      row.set('whatsapp', '5511999999999');
      row.set('address', 'São Paulo, SP');
      row.set('hours', 'Seg a sex 9h–18h · Sáb 9h–13h');
      row.set('maps_url', 'https://maps.google.com');
      app.save(row);
    }

    const seeds = [
      ['Capinhas', 'capinhas', 'capinha'],
      ['Películas', 'peliculas', 'pelicula'],
      ['Carregadores', 'carregadores', 'outro'],
      ['Fones de ouvido', 'fones', 'outro'],
      ['Caixas de som', 'caixas-de-som', 'outro'],
    ];
    for (const [name, slug, kind] of seeds) {
      const found = app.findRecordsByFilter('categories', `slug = '${slug}'`);
      if (!found.length) {
        const row = new Record(categories);
        row.set('name', name);
        row.set('slug', slug);
        row.set('kind', kind);
        row.set('active', true);
        app.save(row);
      }
    }
  },
  (app) => {
    for (const name of ['sale_items', 'counter_sales', 'os_events', 'service_orders', 'problem_reports', 'inventory_products', 'technicians', 'testimonials', 'store_settings', 'categories']) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) { /* already removed */ }
    }
  },
);
