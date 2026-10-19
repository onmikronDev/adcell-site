import { useMemo } from 'react';

/**
 * Session hook sem PocketBase.
 * O login da equipe é feito pela action da rota /entrar (MySQL).
 */
export function useAuth() {
	return useMemo(
		() => ({
			user: null as null,
			isAuthed: false,
			isLoading: false,
			login: async (_email: string, _password: string) => {
				throw new Error('Use o formulário em /entrar.');
			},
			signup: async (
				_email: string,
				_password: string,
				_extraFields: Record<string, unknown> = {},
			) => {
				throw new Error('Cadastro indisponível.');
			},
			logout: () => {},
		}),
		[],
	);
}

export default useAuth;
