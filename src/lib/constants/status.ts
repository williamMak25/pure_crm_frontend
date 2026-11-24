import type { Status } from '#lib/types/index.ts';

export type Tone = 'green' | 'red' | 'blue' | 'amber' | 'neutral';

/** Status → badge tone, matching the Figma badges (Active green, Inactive/Unpaid red, Pending/Lead blue, Archived amber). */
export const STATUS_TONE: Record<Status, Tone> = {
	Active: 'green',
	Paid: 'green',
	Completed: 'green',
	Approved: 'green',
	Accepted: 'green',
	Present: 'green',
	Income: 'green',
	Inactive: 'red',
	Unpaid: 'red',
	Overdue: 'red',
	Rejected: 'red',
	Absent: 'red',
	Expense: 'red',
	'In Progress': 'red',
	Pending: 'blue',
	Lead: 'blue',
	Planning: 'blue',
	Sent: 'blue',
	'To Do': 'blue',
	Archived: 'amber',
	Late: 'amber',
	'On Leave': 'amber',
	Draft: 'neutral',
	Open: 'blue',
	Contacted: 'amber',
	New: 'green',
	'In Pipeline': 'green',
	Lost: 'red'
};

export const TONE_CLASSES: Record<Tone, string> = {
	green: 'bg-green-50 text-green-500',
	red: 'bg-brand-50 text-brand-500',
	blue: 'bg-blue-50 text-blue-500',
	amber: 'bg-amber-50 text-amber-500',
	neutral: 'bg-neutral-100 text-neutral-600'
};

export const PAGE_SIZES = [10, 20, 50] as const;
