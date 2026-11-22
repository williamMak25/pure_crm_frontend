/**
 * DEVELOPMENT FIXTURES ONLY.
 * Loaded exclusively through the mock router when API_MOCK=true. The content
 * mirrors what is shown in the Figma file so screens can be reviewed before
 * the backend exists. Production builds never import this file.
 */
import type {
	Activity,
	AppUser,
	AppUserDetail,
	AttentionItem,
	Attendance,
	Business,
	CashFlow,
	Company,
	Consultant,
	Contact,
	CustomerInvoice,
	Department,
	Employee,
	IncomeExpense,
	InvoiceHistory,
	LeaveRequest,
	ModulePermission,
	OutstandingPayment,
	Payment,
	PayrollRecord,
	SalaryChange,
	PipelineStage,
	Product,
	Quotation,
	QuotationDetail,
	Role,
	SaleInvoiceRow,
	SalesOrder,
	SalesOrderDetail,
	SecuritySettings,
	StatSummary,
	Status,
	Transaction,
	TrendRange,
	TrendSeries,
	University,
	UserSummary,
	WorkItem
} from '#lib/types/index.ts';

const pick = <T>(arr: readonly T[], i: number) => arr[i % arr.length];
const BUSINESSES = ['PURE Education', 'Anime House', 'GPM'] as const;
const day = (i: number) => `${String(((i * 7) % 27) + 1).padStart(2, '0')} Oct 2026`;



/* ---------- Dashboard ---------- */
export const summary: StatSummary[] = [
	{ key: 'contacts', label: 'Total Contacts', value: 1270, caption: 'Customers & leads' },
	{ key: 'orders', label: 'Total Sales Orders', value: 86, caption: '12 awaiting confirmation' },
	{ key: 'invoices', label: 'Pending Invoices', value: 45, caption: '5 overdue' },
	{ key: 'expenses', label: 'Monthly Expenses', value: 1800000, unit: 'MMK', caption: 'Current month' }
];

export const trend: Record<TrendRange, TrendSeries> = {
	weekly: {
		labels: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
		revenue: [560000, 600000, 790000, 550000, 290000, 630000, 160000],
		expenses: [200000, 470000, 240000, 25000, 950000, 240000, 270000]
	},
	monthly: {
		labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
		revenue: [2400000, 3100000, 2750000, 3600000],
		expenses: [1500000, 1800000, 2100000, 1700000]
	},
	yearly: {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		revenue: [9, 11, 10, 13, 12, 15, 14, 16, 15, 18, 17, 19].map((v) => v * 1_000_000),
		expenses: [6, 7, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11].map((v) => v * 1_000_000)
	}
};

export const activities: Activity[] = [
	['New customer added', 'Admin', '10 min ago'],
	['New sale created', 'Staff', '24 min ago'],
	['Invoice generated', 'Admin', '01 hr ago'],
	['Payment received', 'Finance', '45 min ago'],
	['Invoice overdue', 'Admin', '03 hr ago']
].map(([title, actor, timeAgo], i) => ({ id: `a${i}`, title, actor, timeAgo }));

export const outstanding: OutstandingPayment[] = Array.from({ length: 4 }, (_, i) => ({
	id: `op${i}`,
	invoiceNo: 'INV - 903',
	customer: 'Customer A',
	dueDate: '12 Oct 2026',
	amount: 1200000
}));

export const upcoming: WorkItem[] = (['In Progress', 'To Do', 'In Progress', 'To Do', 'In Progress'] as const).map(
	(status, i) => ({ id: `w${i}`, title: '14 approvals waiting on you', date: '12 Oct 2026', status })
);

export const attention: AttentionItem[] = Array.from({ length: 5 }, (_, i) => ({
	id: `at${i}`,
	title: '14 approvals waiting on you',
	description: '40,000 MMK across POs, quotes and journals',
	timeAgo: '10 min ago'
}));

const saleStatuses: Status[] = ['Active', 'Pending', 'Unpaid', 'Active', 'Active', 'Unpaid', 'Pending', 'Active', 'Unpaid', 'Active'];
const saleBiz = ['PURE Education', 'Anime House', 'PURE Education', 'GPM', 'Anime House', 'GPM'];
export const recentSales: SaleInvoiceRow[] = Array.from({ length: 57 }, (_, i) => ({
	id: `rs${i + 1}`,
	orderId: `OD-${String(i + 1).padStart(3, '0')}`,
	invoiceId: i === 9 ? 'INV-10' : `INV-${String(i + 1).padStart(3, '0')}`,
	customer: 'Customer A',
	business: pick(saleBiz, i),
	date: '15 Oct 2026',
	total: 1200000,
	status: pick(saleStatuses, i)
}));

/* ---------- Sales ---------- */
const customers = ['Aung Aung', 'Customer A', 'Min Thu', 'Khin Myo', 'Lay Lay'];
const methods = ['KBZ Pay', 'Cash', 'Bank Transfer', 'Wave Pay', 'AYA Pay'];
export const salesOrders: SalesOrder[] = Array.from({ length: 57 }, (_, i) => ({
	id: `so${i + 1}`,
	orderNo: `SO-${String(i + 1).padStart(3, '0')}`,
	customer: pick(customers, i),
	business: pick(BUSINESSES, i),
	date: day(i),
	total: 250000 + (i % 5) * 150000,
	paymentMethod: pick(methods, i),
	status: pick(['Paid', 'Pending', 'Unpaid', 'Paid', 'Draft'] as Status[], i)
}));

export const quotations: Quotation[] = Array.from({ length: 34 }, (_, i) => ({
	id: `q${i + 1}`,
	quotationNo: `QT-${String(i + 1).padStart(3, '0')}`,
	customer: pick(customers, i),
	business: pick(BUSINESSES, i),
	date: day(i),
	validUntil: day(i + 3),
	total: 400000 + (i % 4) * 200000,
	status: pick(['Draft', 'Sent', 'Accepted', 'Rejected'] as Status[], i)
}));

export const quotationDetail = (id: string): QuotationDetail => {
	const q = quotations.find((x) => x.id === id) ?? quotations[0];
	return {
		id: q.id,
		quotationNo: q.quotationNo,
		quotationDate: q.date,
		expiryDate: q.validUntil,
		status: q.status,
		business: q.business,
		customer: { name: q.customer, phone: '09 123 456 789', email: 'aung@gmail.com', type: 'Individual' },
		items: [{ product: 'UI/UX Design Course', quantity: 1, unitPrice: q.total, amount: q.total }],
		notes: 'Price valid until the expiry date. Includes course materials.'
	};
};

const productNames = ['UI/UX Design Course', 'IELTS Preparation', 'Study Abroad Package', 'Anime Figure Set', 'Japanese N5 Course', 'Visa Consultation'];
export const products: Product[] = Array.from({ length: 28 }, (_, i) => ({
	id: `p${i + 1}`,
	code: `ITM-${String(i + 1).padStart(3, '0')}`,
	name: pick(productNames, i),
	category: pick(['Course', 'Course', 'Service', 'Merchandise', 'Course', 'Service'], i),
	business: pick(['PURE Education', 'PURE Education', 'GPM', 'Anime House', 'PURE Education', 'GPM'], i),
	unitPrice: 250000 + (i % 3) * 100000,
	stock: 10 + ((i * 13) % 90),
	status: pick(['Active', 'Active', 'Inactive'] as Status[], i)
}));

export const orderDetail = (id: string): SalesOrderDetail => {
	const o = salesOrders.find((x) => x.id === id) ?? salesOrders[0];
	return {
		id: o.id,
		orderNo: o.orderNo,
		orderDate: '15 Oct 2026',
		business: 'PURE Education',
		createdBy: 'Micheal Jame',
		customer: { name: 'Aung Aung', phone: '09 123 456 789', email: 'aung@gmail.com', type: 'Individual' },
		items: [{ product: 'UI/UX Design Course', quantity: 1, unitPrice: 250000, amount: 250000 }],
		payment: {
			status: 'Paid',
			method: 'KBZ Pay',
			paidAmount: 250000,
			date: '15 Oct 2026',
			transactionId: 'KP-20261015',
			notes: 'Customer enrolled in UI/UX Design Course. Payment completed successfully.'
		}
	};
};

/* ---------- Invoices ---------- */
export const customerInvoices: CustomerInvoice[] = Array.from({ length: 45 }, (_, i) => ({
	id: `ci${i + 1}`,
	invoiceNo: `INV-${String(i + 1).padStart(3, '0')}`,
	customer: pick(customers, i),
	business: pick(BUSINESSES, i),
	issueDate: day(i),
	dueDate: day(i + 4),
	amount: 1200000,
	status: pick(['Paid', 'Unpaid', 'Overdue', 'Pending'] as Status[], i)
}));

export const payments: Payment[] = Array.from({ length: 40 }, (_, i) => ({
	id: `pm${i + 1}`,
	paymentNo: `PAY-${String(i + 1).padStart(3, '0')}`,
	invoiceNo: `INV-${String(i + 1).padStart(3, '0')}`,
	customer: pick(customers, i),
	method: pick(methods, i),
	date: day(i),
	amount: 250000 + (i % 4) * 250000,
	status: pick(['Paid', 'Pending', 'Paid', 'Rejected'] as Status[], i)
}));

export const invoiceHistory: InvoiceHistory[] = Array.from({ length: 36 }, (_, i) => ({
	id: `ih${i + 1}`,
	invoiceNo: `INV-${String(i + 1).padStart(3, '0')}`,
	customer: pick(customers, i),
	action: pick(['Created', 'Sent', 'Payment received', 'Reminder sent', 'Marked overdue'], i),
	performedBy: pick(['Micheal Jame', 'Finance', 'Staff'], i),
	date: day(i),
	amount: 1200000,
	status: pick(['Draft', 'Sent', 'Paid', 'Pending', 'Overdue'] as Status[], i)
}));

/* ---------- Finance ---------- */
export const incomeExpenses: IncomeExpense[] = Array.from({ length: 48 }, (_, i) => {
	const type = i % 3 === 0 ? 'Expense' : 'Income';
	return {
		id: `ie${i + 1}`,
		refNo: `FIN-${String(i + 1).padStart(3, '0')}`,
		type,
		category: type === 'Income' ? pick(['Course Fees', 'Consultation', 'Merchandise'], i) : pick(['Salary', 'Rent', 'Utilities', 'Marketing'], i),
		business: pick(BUSINESSES, i),
		date: day(i),
		amount: type === 'Income' ? 1200000 : 450000,
		status: pick(['Approved', 'Pending', 'Approved', 'Rejected'] as Status[], i)
	};
});

export const transactions: Transaction[] = Array.from({ length: 52 }, (_, i) => ({
	id: `tx${i + 1}`,
	transactionNo: `TXN-${String(20261000 + i)}`,
	account: pick(['KBZ Bank - 0012', 'AYA Bank - 3304', 'Cash on hand', 'CB Bank - 7781'], i),
	type: i % 3 === 0 ? 'Expense' : 'Income',
	method: pick(methods, i),
	date: day(i),
	amount: 300000 + (i % 5) * 120000,
	status: pick(['Completed', 'Pending', 'Completed', 'Rejected'] as Status[], i)
}));

export const cashFlow = (range: TrendRange): CashFlow => {
	const t = trend[range];
	const income = t.revenue;
	const expense = t.expenses;
	const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
	return {
		labels: t.labels,
		income,
		expense,
		summary: { income: sum(income), expense: sum(expense), net: sum(income) - sum(expense) },
		byCategory: [
			{ label: 'Salary', value: 42 },
			{ label: 'Rent', value: 23 },
			{ label: 'Marketing', value: 18 },
			{ label: 'Utilities', value: 11 },
			{ label: 'Other', value: 6 }
		]
	};
};

/* ---------- HR ---------- */
const empNames = ['Aung Aung', 'Min Thu', 'Khant Ko', 'Oo Lay Gyi', 'Bo Aung', 'Khin Myo', 'Lay Lay', 'Jue Jue', 'Aye Myo', 'Khin Khin'];
const departmentsList = ['Sales', 'Finance', 'Marketing', 'Operations', 'Academic'];
export const employees: Employee[] = Array.from({ length: 42 }, (_, i) => ({
	id: `e${i + 1}`,
	employeeNo: `EMP-${String(i + 1).padStart(3, '0')}`,
	name: pick(empNames, i),
	department: pick(departmentsList, i),
	position: pick(['Executive', 'Manager', 'Officer', 'Coordinator', 'Teacher'], i),
	business: pick(BUSINESSES, i),
	joinDate: day(i).replace('2026', '2025'),
	status: pick(['Active', 'Active', 'On Leave', 'Inactive'] as Status[], i)
}));

export const attendance: Attendance[] = Array.from({ length: 50 }, (_, i) => {
	const status = pick(['Present', 'Present', 'Late', 'Absent', 'On Leave'] as Status[], i);
	const off = status === 'Absent' || status === 'On Leave';
	return {
		id: `att${i + 1}`,
		employee: pick(empNames, i),
		department: pick(departmentsList, i),
		date: '15 Oct 2026',
		checkIn: off ? '-' : status === 'Late' ? '09:42 AM' : '08:55 AM',
		checkOut: off ? '-' : '05:30 PM',
		hours: off ? '-' : status === 'Late' ? '7h 48m' : '8h 35m',
		status
	};
});

export const leaves: LeaveRequest[] = Array.from({ length: 24 }, (_, i) => ({
	id: `lv${i + 1}`,
	employee: pick(empNames, i),
	leaveType: pick(['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'], i),
	from: day(i),
	to: day(i + 1),
	days: (i % 3) + 1,
	reason: pick(['Family event', 'Medical appointment', 'Personal matter', 'Travel'], i),
	status: pick(['Pending', 'Approved', 'Rejected', 'Approved'] as Status[], i)
}));

export const payroll: PayrollRecord[] = Array.from({ length: 57 }, (_, i) => {
	const basic = 240000;
	const allowance = 20000;
	const overtime = 50000;
	const bonus = 20000;
	const deduction = 30000;
	return {
		id: `pr${i + 1}`,
		employeeNo: `EMP-${String(i + 1).padStart(3, '0')}`,
		employee: pick(empNames, i),
		business: pick(['Anime House', 'PURE Education', 'GPM', 'GPM', 'PURE Education', 'GPM', 'Anime House', 'PURE Education', 'GPM', 'Anime House'], i),
		department: pick(['Design', 'Marketing', 'HR', 'Finance', 'IT', 'Finance', 'HR', 'Marketing', 'Design', 'Finance'], i),
		month: 'October 2026',
		basic,
		allowance,
		overtime,
		bonus,
		deduction,
		netPay: basic + allowance + overtime + bonus - deduction,
		paymentDate: '2026-10-24',
		status: pick(['Draft', 'Pending', 'Paid'] as Status[], i)
	};
});

export const salaryHistory: SalaryChange[] = Array.from({ length: 36 }, (_, i) => {
	const previousSalary = 200000 + (i % 4) * 40000;
	return {
		id: `sh${i + 1}`,
		employeeNo: `EMP-${String((i % 20) + 1).padStart(3, '0')}`,
		employee: pick(empNames, i),
		business: pick(BUSINESSES, i),
		department: pick(departmentsList, i),
		previousSalary,
		newSalary: previousSalary + 40000,
		effectiveDate: `2026-${String((i % 9) + 1).padStart(2, '0')}-01`,
		reason: pick(['Annual increment', 'Promotion', 'Adjustment', 'Probation passed'], i),
		approvedBy: 'Micheal Jame'
	};
});

export const departments: Department[] = departmentsList.map((name, i) => ({
	id: `dp${i + 1}`,
	name,
	head: pick(empNames, i * 2),
	business: pick(BUSINESSES, i),
	employees: 6 + i * 3,
	status: 'Active'
}));

/* ---------- Settings ---------- */
export const roles: Role[] = [
	{ id: 'r1', name: 'Super Admin', description: 'Full access to every module and setting.', users: 4 },
	{ id: 'r2', name: 'Admin', description: 'Manage every module except company-wide settings.', users: 4 },
	{ id: 'r3', name: 'Manager', description: 'Manage teams and approve requests.', users: 4 },
	{ id: 'r4', name: 'Accountant', description: 'Invoices, payments and finance.', users: 4 },
	{ id: 'r5', name: 'HR', description: 'Employees, attendance, leave and payroll.', users: 4 },
	{ id: 'r6', name: 'Staff', description: 'Day-to-day work with read access elsewhere.', users: 4 }
];

const modules = ['Overview', 'CRM & Contacts', 'Project & Board', 'Sales', 'Invoices', 'Finance', 'HR & Payroll', 'Setting'];
export const permissions = (roleId: string): ModulePermission[] =>
	modules.map((module, i) => {
		const full = roleId === 'r1' || (roleId === 'r2' && module !== 'Setting');
		const viewer = roleId === 'r6';
		return {
			module,
			actions: {
				create: full || (!viewer && i % 2 === 0),
				read: true,
				update: full || (!viewer && i % 3 !== 2),
				delete: full,
				approve: full || (!viewer && i % 4 === 0)
			}
		};
	});

export const company: Company = {
	id: 'co1',
	name: 'PURE Education',
	email: 'hello@pure-education.com',
	phone: '09 755430342',
	address: 'No. 12, Pyay Road, Kamayut Township, Yangon',
	currency: 'MMK',
	timezone: 'Asia/Yangon',
	hasBranches: false,
	branches: [
		{ id: 'br1', name: 'Yangon HQ', address: 'Pyay Road, Kamayut, Yangon', phone: '09 755430342' },
		{ id: 'br2', name: 'Mandalay Branch', address: '78th Street, Chanayethazan, Mandalay', phone: '09 954335488' }
	]
};

export const users: AppUser[] = Array.from({ length: 18 }, (_, i) => ({
	id: `usr${i + 1}`,
	name: i === 0 ? 'Micheal Jame' : pick(empNames, i),
	email: i === 0 ? 'micheal123@gmail.com' : `user${i + 1}@pure-education.com`,
	phones: ['09 755430342', '09 954335488'],
	role: i === 0 ? 'Super Admin' : pick(roles.map((r) => r.name), i),
	business: pick(BUSINESSES, i),
	avatar: i % 2 === 0 ? '/images/avatar-micheal.png' : '/images/avatar-guest.png',
	status: pick(['Active', 'Active', 'Inactive'] as Status[], i),
	lastActive: pick(['10 min ago', '1 hr ago', 'Yesterday', '3 days ago'], i)
}));

export const userDetail = (id: string): AppUserDetail => {
	const u = users.find((x) => x.id === id) ?? users[0];
	const role = roles.find((r) => r.name === u.role) ?? roles[0];
	return {
		...u,
		roleId: role.id,
		businesses: u.role === 'Super Admin' ? [...BUSINESSES] : [u.business],
		defaultBusiness: u.business,
		permissions: permissions(role.id)
	};
};

export const security: SecuritySettings = {
	twoFactor: true,
	loginAlerts: true,
	sessionTimeout: '30 minutes',
	passwordExpiry: '90 days'
};
