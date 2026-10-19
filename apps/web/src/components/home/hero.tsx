import { Link } from 'react-router';
import { LOGO } from '@/data/brand';
import { DeviceFilter } from '@/components/home/device-filter';
export function Hero() {
  return <section className="hero hero-ad"><div className="hero-copy"><img className="hero-logo" src={LOGO} alt="ADCELL CASE — vendas e assistência técnica" /><h1>Capas, películas e conserto do seu celular.</h1><p>Escolha a marca e o modelo para ver só o que serve no seu aparelho. Ou abra um chamado de assistência agora.</p><DeviceFilter /><div className="hero-actions"><Link className="button button-red" to="/relato">Relatar um problema</Link><Link className="button button-lime" to="/os">Consultar O.S.</Link></div></div></section>;
}
