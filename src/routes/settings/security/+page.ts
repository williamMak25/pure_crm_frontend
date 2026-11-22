import { redirect } from '@sveltejs/kit';

// Security moved into the Security tab of each user's detail page.
export const load = () => redirect(307, '/settings/users');
