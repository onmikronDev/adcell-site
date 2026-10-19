import PocketBase from 'pocketbase';

// Em producao, deixe vazio para usar o proxy /hcgi/platform.
// Em desenvolvimento local, crie apps/web/.env com:
// VITE_POCKETBASE_URL=http://localhost:8090
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new PocketBase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient, POCKETBASE_API_URL };
