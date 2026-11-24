import type { IconName } from './icons';

export interface NavItem {
	label: string;
	href: string;
	icon: IconName;
	/** Paths that should mark this item active. */
	match: string;
	children?: { label: string; href: string }[];
}

export const NAV_ITEMS: NavItem[] = [
	{ label: 'Overview', href: '/', icon: 'overview', match: '/' },
	{ label: 'CRM & Contacts', href: '/crm/contacts', icon: 'contacts', match: '/crm' },
	{ label: 'Project & Board', href: '/projects', icon: 'board', match: '/projects' },
	{ label: 'Sales', href: '/sales/orders', icon: 'sales', match: '/sales' },
	{ label: 'Invoices', href: '/invoices/customer-invoices', icon: 'invoices', match: '/invoices' },
	{ label: 'Finance', href: '/finance/income-expense', icon: 'finance', match: '/finance' },
	{ label: 'HR & Payroll', href: '/hr/employees', icon: 'hr', match: '/hr' },
	{
		label: 'Setting',
		href: '/settings/users',
		icon: 'settings',
		match: '/settings',
		children: [
			{ label: 'User Management', href: '/settings/users' },
			{ label: 'Company Management', href: '/settings/company' },
			{ label: 'Roles & Permissions', href: '/settings/roles' }
		]
	}
];

export interface ModuleTab {
	label: string;
	href: string;
}

export const MODULE_TABS = {
	crm: [
		{ label: 'Contact List', href: '/crm/contacts' },
		{ label: 'Leads', href: '/crm/leads' },
		{ label: 'Pipeline', href: '/crm/pipeline' },
		{ label: 'Universities', href: '/crm/universities' },
		{ label: 'Consultant', href: '/crm/consultants' }
	],
	sales: [
		{ label: 'Orders', href: '/sales/orders' },
		{ label: 'Quotations', href: '/sales/quotations' },
		{ label: 'Items', href: '/sales/items' }
	],
	invoices: [
		{ label: 'Customer Invoices', href: '/invoices/customer-invoices' },
		{ label: 'Payments', href: '/invoices/payments' },
		{ label: 'Invoice History', href: '/invoices/history' }
	],
	finance: [
		{ label: 'Income & Expense', href: '/finance/income-expense' },
		{ label: 'Transactions', href: '/finance/transactions' },
		{ label: 'Cash Flow', href: '/finance/cash-flow' }
	],
	hr: [
		{ label: 'Employee', href: '/hr/employees' },
		{ label: 'Attendance', href: '/hr/attendance' },
		{ label: 'Leave', href: '/hr/leave' },
		{ label: 'Payroll', href: '/hr/payroll' },
		{ label: 'Salary History', href: '/hr/salary-history' }
	]
} satisfies Record<string, ModuleTab[]>;
