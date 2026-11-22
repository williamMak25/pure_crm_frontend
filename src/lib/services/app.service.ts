import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { Business, CurrentUser } from '#lib/types/index.ts';
import { http } from './http';

export const appService = {
	businesses: () => http.get<Business[]>(ENDPOINTS.businesses),
	me: () => http.get<CurrentUser>(ENDPOINTS.me)
};
