import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { AppUser, AppUserDetail, Company, ID, ModulePermission, Role, SecuritySettings } from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

export const settingsService = {
	roles: () => http.get<Role[]>(ENDPOINTS.roles),
	permissions: (roleId: ID) => http.get<ModulePermission[]>(`${ENDPOINTS.roles}/${roleId}/permissions`),
	savePermissions: (roleId: ID, body: ModulePermission[]) =>
		http.put<ModulePermission[]>(`${ENDPOINTS.roles}/${roleId}/permissions`, body),
	company: () => http.get<Company>(ENDPOINTS.company),
	saveCompany: (body: Partial<Company>) => http.patch<Company>(ENDPOINTS.company, body),
	users: createResourceService<AppUser>(ENDPOINTS.users),
	user: (id: ID) => http.get<AppUserDetail>(`${ENDPOINTS.users}/${id}`),
	saveAccess: (id: ID, body: { roleId: ID; businesses: string[]; defaultBusiness: string }) =>
		http.patch<AppUserDetail>(`${ENDPOINTS.users}/${id}`, body),
	security: () => http.get<SecuritySettings>(ENDPOINTS.security),
	saveSecurity: (body: SecuritySettings) => http.put<SecuritySettings>(ENDPOINTS.security, body)
};
