import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type {
	AppUser,
	AppUserDetail,
	Company,
	ID,
	ListParams,
	ModulePermission,
	Paginated,
	Role,
	SecuritySettings,
	UserUpdate,
	UserWithPassword
} from '#lib/types/index.ts';
import { http } from './http';

/** The users collection, in the shape ResourceTable / createCreateMutation expect. */
const users = {
	path: ENDPOINTS.users,
	list: (params: ListParams = {}, signal?: AbortSignal) => http.get<Paginated<AppUser>>(ENDPOINTS.users, { ...params }, signal),
	get: (id: ID, signal?: AbortSignal) => http.get<AppUserDetail>(`${ENDPOINTS.users}/${id}`, undefined, signal),
	/** Returns the new account and its one-time temporary password. */
	create: (body: Record<string, unknown>) => http.post<UserWithPassword>(ENDPOINTS.users, body),
	update: (id: ID, body: UserUpdate) => http.patch<AppUserDetail>(`${ENDPOINTS.users}/${id}`, body),
	remove: (id: ID) => http.patch<AppUserDetail>(`${ENDPOINTS.users}/${id}`, { status: 'Inactive' })
};

export const settingsService = {
	roles: () => http.get<Role[]>(ENDPOINTS.roles),
	permissions: (roleId: ID) => http.get<ModulePermission[]>(`${ENDPOINTS.roles}/${roleId}/permissions`),
	savePermissions: (roleId: ID, body: ModulePermission[]) =>
		http.put<ModulePermission[]>(`${ENDPOINTS.roles}/${roleId}/permissions`, body),
	company: () => http.get<Company>(ENDPOINTS.company),
	saveCompany: (body: Partial<Company>) => http.patch<Company>(ENDPOINTS.company, body),
	users,
	user: (id: ID, signal?: AbortSignal) => users.get(id, signal),
	updateUser: (id: ID, body: UserUpdate) => users.update(id, body),
	resetPassword: (id: ID) => http.post<UserWithPassword>(`${ENDPOINTS.users}/${id}/reset-password`),
	/** Take someone out of the selected company (their account and other companies stay). */
	removeFromCompany: (id: ID) => http.delete<void>(`${ENDPOINTS.users}/${id}/membership`),
	/** Super admins: a new company with the default roles and pipeline. */
	createCompany: (name: string) => http.post<Company>(ENDPOINTS.companies, { name }),
	deleteCompany: (id: ID) => http.delete<void>(`${ENDPOINTS.companies}/${id}`),
	security: () => http.get<SecuritySettings>(ENDPOINTS.security),
	saveSecurity: (body: SecuritySettings) => http.put<SecuritySettings>(ENDPOINTS.security, body),
	/** The signed-in user's own password. Other devices are signed out. */
	changePassword: (body: { currentPassword: string; newPassword: string }) => http.post<void>(`${ENDPOINTS.me}/password`, body)
};
