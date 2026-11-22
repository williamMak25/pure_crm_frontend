/** REST paths, relative to API_BASE_URL. Adjust here when the backend contract changes. */
export const ENDPOINTS = {
	login: '/auth/login',
	refresh: '/auth/refresh',
	logout: '/auth/logout',
	businesses: '/businesses',
	me: '/me',

	dashboardSummary: '/dashboard/summary',
	dashboardTrend: '/dashboard/revenue-expenses',
	dashboardActivities: '/dashboard/activities',
	dashboardOutstanding: '/dashboard/outstanding-payments',
	dashboardUpcoming: '/dashboard/upcoming-work',
	dashboardAttention: '/dashboard/attention',
	dashboardRecentSales: '/dashboard/recent-sales',

	contacts: '/crm/contacts',
	pipeline: '/crm/pipeline',
	universities: '/crm/universities',
	consultants: '/crm/consultants',
	deals: '/crm/deals',
	dealActivities: '/crm/deal-activities',
	crmPeople: '/crm/people',

	boards: '/projects/boards',
	taskLists: '/projects/lists',
	tasks: '/projects/tasks',
	checklistItems: '/projects/checklist-items',
	boardMembers: '/projects/board-members',

	salesOrders: '/sales/orders',
	quotations: '/sales/quotations',
	products: '/sales/items',

	customerInvoices: '/invoices/customer-invoices',
	payments: '/invoices/payments',
	invoiceHistory: '/invoices/history',

	incomeExpenses: '/finance/income-expenses',
	transactions: '/finance/transactions',
	cashFlow: '/finance/cash-flow',

	employees: '/hr/employees',
	attendance: '/hr/attendance',
	leaves: '/hr/leaves',
	payroll: '/hr/payroll',
	salaryHistory: '/hr/salary-history',
	departments: '/hr/departments',

	roles: '/settings/roles',
	company: '/settings/company',
	users: '/settings/users',
	security: '/settings/security'
} as const;

export type ResourceEndpoint = keyof typeof ENDPOINTS;

/**
 * Paths the real backend already serves. While API_MOCK=true, requests under these
 * prefixes still go to the API and everything else is answered by src/lib/mocks.
 * Add a module's prefix here once its backend endpoints exist.
 */
export const LIVE_PREFIXES = ['/auth', '/me', '/businesses', '/crm', '/projects'] as const;
