/**
 * DEVELOPMENT-ONLY mock API. Reached only through `request()` in services/http.ts
 * when API_MOCK=true. Emulates latency so loading skeletons are visible.
 * Auth, /me, /businesses, CRM and Projects are served by the real API (LIVE_PREFIXES).
 */
import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import { ApiError, type RequestOptions } from '#lib/services/http.ts';
import type { Paginated, TrendRange } from '#lib/types/index.ts';
import * as db from './data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function paginate<T extends object>(rows: T[], q: RequestOptions['query'] = {}): Paginated<T> {
	const page = Number(q.page ?? 1);
	const pageSize = Number(q.pageSize ?? 10);
	const search = String(q.search ?? '').toLowerCase().trim();
	const status = String(q.status ?? '');
	const business = String(q.business ?? '');
	let filtered = rows;
	if (search) filtered = filtered.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search)));
	if (status) filtered = filtered.filter((r) => (r as { status?: string }).status === status);
	if (business)
		filtered = filtered.filter((r) => {
			const b = (r as { business?: string }).business;
			return !b || b.toLowerCase().replace('educaiton', 'education') === business.toLowerCase();
		});
	return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize };
}

const collections: Record<string, object[]> = {
	[ENDPOINTS.dashboardRecentSales]: db.recentSales,
	[ENDPOINTS.salesOrders]: db.salesOrders,
	[ENDPOINTS.quotations]: db.quotations,
	[ENDPOINTS.products]: db.products,
	[ENDPOINTS.customerInvoices]: db.customerInvoices,
	[ENDPOINTS.payments]: db.payments,
	[ENDPOINTS.invoiceHistory]: db.invoiceHistory,
	[ENDPOINTS.incomeExpenses]: db.incomeExpenses,
	[ENDPOINTS.transactions]: db.transactions,
	[ENDPOINTS.employees]: db.employees,
	[ENDPOINTS.attendance]: db.attendance,
	[ENDPOINTS.leaves]: db.leaves,
	[ENDPOINTS.payroll]: db.payroll,
	[ENDPOINTS.salaryHistory]: db.salaryHistory,
	[ENDPOINTS.departments]: db.departments,
	[ENDPOINTS.users]: db.users
};

export async function handleMockRequest<T>(method: string, path: string, opts: RequestOptions): Promise<T> {
	await delay(method === 'GET' ? 650 : 400);
	const q = opts.query ?? {};
	const body = (opts.body ?? {}) as Record<string, unknown>;
	const out = (v: unknown) => v as T;

	if (method === 'GET') {
		switch (path) {
			case ENDPOINTS.dashboardSummary: return out(db.summary);
			case ENDPOINTS.dashboardTrend: return out(db.trend[(q.range as TrendRange) ?? 'weekly']);
			case ENDPOINTS.dashboardActivities: return out(db.activities);
			case ENDPOINTS.dashboardOutstanding: return out(db.outstanding);
			case ENDPOINTS.dashboardUpcoming: return out(db.upcoming);
			case ENDPOINTS.dashboardAttention: return out(db.attention);
			case ENDPOINTS.cashFlow: return out(db.cashFlow((q.range as TrendRange) ?? 'monthly'));
			case ENDPOINTS.roles: return out(db.roles);
			case ENDPOINTS.company: return out(db.company);
			case ENDPOINTS.security: return out(db.security);
		}
		if (collections[path]) return out(paginate(collections[path], q));

		const perm = path.match(/^\/settings\/roles\/([^/]+)\/permissions$/);
		if (perm) return out(db.permissions(perm[1]));
		const order = path.match(/^\/sales\/orders\/([^/]+)$/);
		if (order) return out(db.orderDetail(order[1]));
		const quotation = path.match(/^\/sales\/quotations\/([^/]+)$/);
		if (quotation) return out(db.quotationDetail(quotation[1]));
		const user = path.match(/^\/settings\/users\/([^/]+)$/);
		if (user) return out(db.userDetail(user[1]));
		const item = path.match(/^(.*)\/([^/]+)$/);
		if (item && collections[item[1]]) {
			const found = collections[item[1]].find((r) => (r as { id: string }).id === item[2]);
			if (found) return out(found);
		}
		throw new ApiError('Not found', 404);
	}

	if (method === 'POST' && collections[path]) {
		const row = { id: crypto.randomUUID(), status: 'Active', ...body };
		collections[path].unshift(row);
		return out(row);
	}
	// Mutations that only need acknowledging in the mock layer.
	return out(method === 'PUT' || method === 'PATCH' ? body : {});
}
