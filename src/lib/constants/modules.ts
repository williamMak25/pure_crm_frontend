import { MODULE_TABS } from './navigation.ts';

/** Page titles / descriptions per module (Figma "Main Title and Description"). */
export const MODULES = {
	crm: {
		title: 'CRM & Contacts',
		description: 'Manage contacts, sales opportunities, university partnerships, and consultant relationships across your businesses.',
		tabs: MODULE_TABS.crm
	},
	sales: {
		title: 'Sale Management',
		description: 'Track sales orders, quotations and the items you sell across every business.',
		tabs: MODULE_TABS.sales
	},
	invoices: {
		title: 'Invoice',
		description: 'Create customer invoices, record payments and review the full invoice history.',
		tabs: MODULE_TABS.invoices
	},
	finance: {
		title: 'Finance',
		description: 'Monitor income, expenses and transactions to keep cash flow healthy.',
		tabs: MODULE_TABS.finance
	},
	hr: {
		title: 'HR & Payroll Management',
		description: 'Manage employee information, attendance, leave, payroll and salary records efficiently across your business.',
		tabs: MODULE_TABS.hr
	}
} as const;
