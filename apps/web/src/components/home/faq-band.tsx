import { FAQ } from '@/data/brand';
export function FaqBand() {
  return <section className="section" id="faq"><span className="eyebrow">PERGUNTAS FREQUENTES</span><h2>Reparo, prazo e garantia</h2><div className="faq-list">{FAQ.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>;
}
