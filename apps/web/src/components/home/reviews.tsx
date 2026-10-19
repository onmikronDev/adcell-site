import type { PublicTestimonial } from '@/lib/inventory.server';
export function Reviews({ items }: { items: PublicTestimonial[] }) {
  return <section className="section reviews"><span className="eyebrow">QUEM JÁ PASSOU AQUI</span><h2>Avaliações de clientes</h2>{items.length === 0 ? <p className="page-intro">As avaliações publicadas pela loja aparecem aqui.</p> : <div className="review-grid">{items.map(item => <blockquote key={item.id}><strong>{'★'.repeat(item.rating || 5)}</strong><p>{item.text}</p><cite>{item.name}</cite></blockquote>)}</div>}
  </section>;
}
