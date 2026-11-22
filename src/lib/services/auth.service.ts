import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { CurrentUser } from '#lib/types/index.ts';
import { http } from './http';

export const authService = {
	login: (body: { email: string; password: string }) => http.post<CurrentUser>(ENDPOINTS.login, body),
	logout: () => http.post<void>(ENDPOINTS.logout)
};
