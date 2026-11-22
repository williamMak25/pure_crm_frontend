import type { ID, ListParams, Paginated } from '#lib/types/index.ts';
import { http } from './http';

/** Standard CRUD client for a REST collection that returns `Paginated<T>` lists. */
export function createResourceService<T, TInput = Partial<T>>(path: string) {
	return {
		path,
		list: (params: ListParams = {}, signal?: AbortSignal) =>
			http.get<Paginated<T>>(path, { ...params }, signal),
		get: (id: ID, signal?: AbortSignal) => http.get<T>(`${path}/${id}`, undefined, signal),
		create: (body: TInput) => http.post<T>(path, body),
		update: (id: ID, body: Partial<TInput>) => http.patch<T>(`${path}/${id}`, body),
		remove: (id: ID) => http.delete<void>(`${path}/${id}`)
	};
}

export type ResourceService<T, TInput = Partial<T>> = ReturnType<typeof createResourceService<T, TInput>>;
