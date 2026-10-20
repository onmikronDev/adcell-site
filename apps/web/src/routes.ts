import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('catalogo', 'routes/catalogo.tsx'),
	route('produto/:handle', 'routes/produto.$handle.tsx'),
	route('item/:id', 'routes/item.$id.tsx'),
	route('os', 'routes/os.tsx'),
	route('relato', 'routes/relato.tsx'),
	route('entrar', 'routes/entrar.tsx'),
	route('admin', 'routes/admin.tsx', [
		index('routes/admin._index.tsx'),
		route('categorias', 'routes/admin.categorias.tsx'),
		route('produtos', 'routes/admin.produtos.tsx'),
		route('ordens', 'routes/admin.ordens.tsx'),
		route('pdv', 'routes/admin.pdv.tsx'),
		route('relatorios', 'routes/admin.relatorios.tsx'),
		route('chamados', 'routes/admin.chamados.tsx'),
		route('config', 'routes/admin.config.tsx'),
	]),
	route('carrinho', 'routes/carrinho.tsx'),
	route('contato', 'routes/contato.tsx'),
	route('checkout/success', 'routes/checkout.success.tsx'),
	route('checkout/cancelled', 'routes/checkout.cancelled.tsx'),
] satisfies RouteConfig;
