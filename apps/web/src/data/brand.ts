export const LOGO = 'https://horizons-cdn.hostinger.com/201f7f4c-30ea-4432-b238-989dfd280380/e70507f288c9824d4be41aa96a0e1208.png';
export const STORE_NAME = 'ADCELL CASE';
export const PHONE_BRANDS = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Realme', 'LG', 'Outro'] as const;
export const PHONE_MODELS: Record<string, string[]> = {
  Apple: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 16'],
  Samsung: ['Galaxy A15', 'Galaxy A35', 'Galaxy A55', 'Galaxy S23', 'Galaxy S24', 'Galaxy S25'],
  Motorola: ['Moto G24', 'Moto G54', 'Moto G84', 'Edge 40', 'Edge 50'],
  Xiaomi: ['Redmi Note 13', 'Redmi Note 14', 'Poco X6', 'Poco X7'],
  Realme: ['C61', 'C67', 'Note 60'],
  LG: ['K52', 'K62'],
  Outro: ['Outro modelo'],
};
export const OS_STATUS = {
  em_analise: 'Em análise',
  aguardando_peca: 'Aguardando peça',
  em_reparo: 'Em reparo',
  pronto: 'Pronto para retirada',
  entregue: 'Entregue',
} as const;
export const FILM_TYPES = ['Privacidade', 'Fosca', 'Vidro', 'Hidrogel', 'Outro'] as const;
export const PAYMENTS = [
  { id: 'pix', label: 'Pix' },
  { id: 'credito', label: 'Cartão de crédito' },
  { id: 'debito', label: 'Cartão de débito' },
  { id: 'dinheiro', label: 'Dinheiro' },
] as const;
export const FAQ = [
  { q: 'Quanto tempo leva um reparo?', a: 'A análise inicial costuma sair no mesmo dia. Trocas simples podem ficar prontas em algumas horas; reparos que dependem de peça seguem o prazo informado na ordem de serviço.' },
  { q: 'O reparo tem garantia?', a: 'Serviços executados pela loja têm garantia sobre a peça e a mão de obra, conforme o prazo registrado na O.S. Danos novos, queda ou contato com líquido após a entrega não entram na garantia.' },
  { q: 'Preciso deixar o aparelho?', a: 'Sim, para a maioria dos reparos. Na entrada fazemos um checklist do estado físico (tela, touch, carcaça e se liga) para proteger você e a loja.' },
  { q: 'Como acompanho o conserto?', a: 'Use o número da O.S. ou o CPF informado no balcão na consulta de status do site.' },
];
export const CHECKLIST = [
  { key: 'liga', label: 'Liga?' },
  { key: 'tela', label: 'Tela trincada?' },
  { key: 'touch', label: 'Touch funcionando?' },
  { key: 'carcaca', label: 'Carcaça riscada?' },
  { key: 'camera', label: 'Câmera ok?' },
  { key: 'bateria', label: 'Bateria estufada?' },
];
export function whatsappLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits || '5500000000000'}?text=${encodeURIComponent(text)}`;
}
export function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
