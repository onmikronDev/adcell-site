/**
 * Checkout via WhatsApp.
 * Monta uma mensagem com os itens do carrinho e abre a conversa.
 */
export type WhatsAppItem = {
  title: string;
  quantity: number;
  price_formatted: string;
};

export function buildWhatsAppCheckoutUrl(options: {
  phone: string;
  items: WhatsAppItem[];
  baseUrl?: string;
}): string {
  const { phone, items } = options;

  const lines = items.map(
    (item) =>
      `• ${item.quantity}x ${item.title} — ${item.price_formatted}`,
  );

  const total = items.reduce((acc, item) => {
    const value = Number(
      item.price_formatted.replace(/[^\d,]/g, "").replace(",", "."),
    );
    return acc + (Number.isFinite(value) ? value * item.quantity : 0);
  }, 0);

  const message = [
    "Olá! Quero finalizar minha compra:",
    "",
    ...lines,
    "",
    `Total: ${total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
  ].join("\n");

  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
