migrate((app) => {
 let collection;
 try { collection = app.findCollectionByNameOrId('store_contacts'); } catch (_) {
 collection = new Collection({ name: 'store_contacts', type: 'base', listRule: null, viewRule: null, createRule: '', updateRule: null, deleteRule: null, fields: [
 { name: 'name', type: 'text', required: true, min: 2, max: 120 },
 { name: 'email', type: 'email', required: true },
 { name: 'subject', type: 'text', required: true, max: 100 },
 { name: 'message', type: 'text', required: true, min: 10, max: 5000 },
 { name: 'consent', type: 'bool', required: true },
 { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
 { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true }
 ] }); app.save(collection);
 }
}, (app) => { const collection = app.findCollectionByNameOrId('store_contacts'); app.delete(collection); });