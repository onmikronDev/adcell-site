/**
 * Stub neutro — o PocketBase foi removido do projeto.
 * A loja agora usa MySQL via @/api/store.server.
 * Mantém as exportações para não quebrar imports existentes.
 */
export type RecordListResult<T> = {
  items: T[];
  totalItems: number;
};

const removido = () => {
  throw new Error(
    'PocketBase foi removido. Use a camada MySQL via @/api/store.server.',
  );
};

export const pocketbaseAdmin = {
  listRecords: removido,
  getRecord: removido,
  createRecord: removido,
  createRecords: removido,
  updateRecord: removido,
  deleteRecord: removido,
  getFileToken: removido,
  send: removido,
};

export default pocketbaseAdmin;
