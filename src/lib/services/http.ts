import { browser } from '$app/env';
import { API_BASE_URL, API_MOCK } from '$app/env/public';
import { ENDPOINTS, LIVE_PREFIXES } from '#lib/constants/endpoints.ts';
import { ui } from '#lib/stores/ui.svelte.ts';

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public body?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
	query?: Query;
	body?: unknown;
	signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query) {
	const base = API_BASE_URL.replace(/\/$/, '');
	const url = new URL(`${base}${path}`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
	for (const [k, v] of Object.entries(query ?? {})) {
		if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
	}
	return url;
}

const isLive = (path: string) => LIVE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

// One refresh at a time: parallel 401s all wait for the same POST /auth/refresh.
let refreshing: Promise<boolean> | null = null;
function refreshSession() {
	refreshing ??= fetch(buildUrl(ENDPOINTS.refresh), { method: 'POST', credentials: 'include' })
		.then((res) => res.ok)
		.catch(() => false)
		.finally(() => (refreshing = null));
	return refreshing;
}

function redirectToLogin() {
	if (!browser || window.location.pathname === '/login') return;
	const next = window.location.pathname + window.location.search;
	// A full page load also drops every cached query from the old session.
	window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}

/**
 * Single entry point for every API call. Services call this; components never do.
 * When API_MOCK=true (local development only) requests are answered by
 * src/lib/mocks, except paths in LIVE_PREFIXES — the mock module is dynamically
 * imported, so it is dropped from production bundles when the flag is off.
 *
 * Sessions live in httpOnly cookies. A 401 triggers one silent refresh and a retry;
 * if that fails too, the browser goes to /login.
 */
export async function request<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
	if (API_MOCK && !isLive(path)) {
		const { handleMockRequest } = await import('#lib/mocks/router.ts');
		return handleMockRequest<T>(method, path, opts);
	}

	const headers: Record<string, string> = {};
	if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
	// Every company stands on its own: the API scopes each request to the one picked in the switcher.
	if (ui.companyId) headers['X-Company'] = ui.companyId;
	const send = () =>
		fetch(buildUrl(path, opts.query), {
			method,
			signal: opts.signal,
			credentials: 'include',
			headers,
			body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
		});

	let res = await send();
	if (res.status === 401 && !path.startsWith('/auth/')) {
		if (await refreshSession()) res = await send();
		if (res.status === 401) redirectToLogin();
	}

	const text = await res.text();
	const data = text ? JSON.parse(text) : undefined;
	if (!res.ok) {
		throw new ApiError((data as { message?: string })?.message ?? res.statusText, res.status, data);
	}
	return data as T;
}

export const http = {
	get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>('GET', path, { query, signal }),
	post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
	put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
	patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
	delete: <T>(path: string) => request<T>('DELETE', path)
};
