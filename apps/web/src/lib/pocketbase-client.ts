/**
 * Stub neutro — o PocketBase foi removido do projeto.
 * A loja agora usa MySQL via @/api/store.server.
 * Mantém as exportações para não quebrar imports existentes.
 */
export const POCKETBASE_API_URL = '';

const handler = {
  get() {
    throw new Error(
      'PocketBase foi removido. Use a camada MySQL via @/api/store.server.',
    );
  },
};

export const pocketbaseClient = new Proxy({}, handler);
export default pocketbaseClient;
