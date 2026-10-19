import { Form } from 'react-router';
import { PHONE_BRANDS, PHONE_MODELS } from '@/data/brand';
import { Search } from 'lucide-react';
export function DeviceFilter({ brand = '', model = '' }: { brand?: string; model?: string }) {
  const models = PHONE_MODELS[brand] || [];
  return <Form method="get" action="/catalogo" className="device-filter"><p>Filtro por modelo</p><label>Marca<select name="marca" defaultValue={brand} aria-label="Marca do celular"><option value="">Todas</option>{PHONE_BRANDS.map(item => <option key={item}>{item}</option>)}</select></label><label>Modelo<select name="modelo" defaultValue={model} aria-label="Modelo do celular"><option value="">Todos</option>{models.map(item => <option key={item}>{item}</option>)}</select></label><button className="button button-red" type="submit"><Search size={16} /> Ver compatíveis</button></Form>;
}
