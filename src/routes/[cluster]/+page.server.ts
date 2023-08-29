import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = () => {
	throw redirect(307, '/People/-3');
}