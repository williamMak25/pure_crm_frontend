/* ---------- Shared ---------- */
export type ID = string;

export interface Paginated<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

export interface ListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	business?: string;
	status?: string;
}

export type Status =
	| 'Active'
	| 'Inactive'
	| 'Pending'
	| 'Unpaid'
	| 'Paid'
	| 'Lead'
	| 'Archived'
	| 'Completed'
	| 'Planning'
	| 'In Progress'
	| 'To Do'
	| 'Draft'
	| 'Sent'
	| 'Approved'
	| 'Accepted'
	| 'Rejected'
	| 'Overdue'
	| 'Present'
	| 'Absent'
	| 'Late'
	| 'On Leave'
	| 'Income'
	| 'Expense';

export interface Business {
	id: ID;
	name: string;
}

export interface UserSummary {
	id: ID;
	name: string;
	role: string;
	avatar?: string | null;
	email?: string | null;
	phones?: string[];
}

/** GET /me and POST /auth/login. `permissions` maps a module to its allowed actions. */
export interface CurrentUser extends UserSummary {
	isSuperuser: boolean;
	permissions: Record<string, PermissionAction[]>;
}

/* ---------- Dashboard ---------- */
export interface StatSummary {
	key: 'contacts' | 'orders' | 'invoices' | 'expenses';
	label: string;
	value: number;
	unit?: string;
	caption: string;
}

export interface TrendSeries {
	labels: string[];
	revenue: number[];
	expenses: number[];
}

export type TrendRange = 'weekly' | 'monthly' | 'yearly';

export interface Activity {
	id: ID;
	title: string;
	actor: string;
	timeAgo: string;
}

export interface OutstandingPayment {
	id: ID;
	invoiceNo: string;
	customer: string;
	dueDate: string;
	amount: number;
}

export interface WorkItem {
	id: ID;
	title: string;
	date: string;
	status: 'In Progress' | 'To Do';
}

export interface AttentionItem {
	id: ID;
	title: string;
	description: string;
	timeAgo: string;
}

export interface SaleInvoiceRow {
	id: ID;
	orderId: string;
	invoiceId: string;
	customer: string;
	business: string;
	date: string;
	total: number;
	status: Status;
}

/* ---------- CRM ---------- */
// Dates are ISO strings ("2026-10-15"). Optional fields come back as null when empty.
export interface Contact {
	id: ID;
	name: string;
	company: string | null;
	email: string | null;
	phone: string | null;
	business: string;
	businessId: ID;
	owner: string | null;
	ownerId: ID | null;
	followUpDate: string | null;
	status: Status;
	notes: string | null;
}

export interface University {
	id: ID;
	name: string;
	country: string | null;
	email: string | null;
	phone: string | null;
	website: string | null;
	business: string;
	businessId: ID;
	status: Status;
}

export interface Consultant {
	id: ID;
	name: string;
	company: string | null;
	country: string | null;
	email: string | null;
	phone: string | null;
	business: string;
	businessId: ID;
	status: Status;
}

export interface Deal {
	id: ID;
	stageId: ID;
	contactId: ID | null;
	name: string;
	company: string | null;
	amount: number | null;
	tags: string[];
	rating: number;
	date: string | null;
	scheduled: boolean;
	position: number;
	owner: UserSummary | null;
}

export interface Ref {
	id: ID;
	name: string;
}

/** GET /crm/deals/{id}: the "Edit Pipeline" dialog. */
export interface DealDetail extends Deal {
	business: string;
	businessId: ID;
	stageName: string;
	email: string | null;
	phone: string | null;
	socialMediaLink: string | null;
	consultant: Ref | null;
	/** ISO datetime ("Created On"). */
	openedAt: string;
	universities: Ref[];
}

export interface DealUpdate extends Partial<Omit<DealInput, 'email' | 'phone' | 'socialMediaLink' | 'consultantId'>> {
	stageId?: ID;
	position?: number;
	contact?: string;
	email?: string | null;
	phone?: string | null;
	socialMediaLink?: string | null;
	consultantId?: ID | null;
	openedAt?: string;
	universityIds?: ID[];
}

export type DealMessageKind = 'message' | 'note';

export interface DealMessage {
	id: ID;
	kind: DealMessageKind;
	author: UserSummary | null;
	recipient: string | null;
	subject: string | null;
	body: string;
	stageName: string | null;
	createdAt: string;
}

export type ActivityKind = 'To Do' | 'Email' | 'Call' | 'Meeting' | 'Document' | 'Signature';

export interface DealActivity {
	id: ID;
	kind: ActivityKind;
	summary: string;
	dueDate: string | null;
	assignedTo: UserSummary | null;
	done: boolean;
	createdAt: string;
}

export interface DealInput {
	name: string;
	contactId?: ID;
	company?: string;
	email?: string;
	phone?: string;
	amount?: number;
	tags?: string[];
	rating?: number;
	date?: string;
	scheduled?: boolean;
	owner?: string;
	socialMediaLink?: string;
	consultantId?: ID;
	universityIds?: ID[];
}

export interface PipelineStage {
	id: ID;
	name: string;
	color: string;
	position: number;
	/** Share of the business's deals in this stage, 0–1. */
	progress: number;
	total: number;
	deals: Deal[];
}

/* ---------- Project & Board ---------- */
export type BoardStatus = 'Completed' | 'Planning' | 'In Progress';
export type Visibility = 'private' | 'workspace' | 'public';
export type BoardAccess = 'Admin' | 'Member' | 'Viewer';

/** Status and due date are worked out by the API from the board's cards. */
export interface Board {
	id: ID;
	business: string;
	businessId: ID;
	title: string;
	status: BoardStatus;
	taskCount: number;
	dueDate: string | null;
	visibility: Visibility;
}

export interface Task {
	id: ID;
	listId: ID;
	title: string;
	cover: string | null;
	labels: string[];
	members: UserSummary[];
	/** First member, shown on the card. */
	assignee: UserSummary | null;
	dueDate: string | null;
	completed: boolean;
	hasDescription: boolean;
	attachments: number;
	checklistDone: number;
	checklistTotal: number;
	updatedAt: string;
}

export interface TaskList {
	id: ID;
	title: string;
	position: number;
	tasks: Task[];
}

export interface BoardMember extends UserSummary {
	memberId: ID;
	access: BoardAccess;
	label: string;
}

export interface BoardDetail extends Board {
	lists: TaskList[];
	members: BoardMember[];
	/** Add lists and cards. False for Viewers. */
	canEdit: boolean;
	/** Share, member access, visibility. */
	canManage: boolean;
}

export interface ChecklistItem {
	id: ID;
	text: string;
	done: boolean;
}

/** The open card (Figma "Component 2"). */
export interface TaskDetail extends Task {
	boardId: ID;
	listTitle: string;
	description: string | null;
	checklist: ChecklistItem[];
	canEdit: boolean;
}

export interface TaskUpdate {
	title?: string;
	description?: string | null;
	cover?: string | null;
	labels?: string[];
	dueDate?: string | null;
	completed?: boolean;
	memberIds?: ID[];
}

export interface TaskComment {
	id: ID;
	author: UserSummary | null;
	body: string;
	createdAt: string;
}

/* ---------- Sales ---------- */
export interface SalesOrder {
	id: ID;
	orderNo: string;
	customer: string;
	business: string;
	date: string;
	total: number;
	paymentMethod: string;
	status: Status;
}

export interface Quotation {
	id: ID;
	quotationNo: string;
	customer: string;
	business: string;
	date: string;
	validUntil: string;
	total: number;
	status: Status;
}

export interface QuotationDetail {
	id: ID;
	quotationNo: string;
	quotationDate: string;
	expiryDate: string;
	status: Status;
	business: string;
	customer: { name: string; phone: string; email: string; type: string };
	items: OrderLine[];
	notes: string;
}

export interface Product {
	id: ID;
	code: string;
	name: string;
	category: string;
	business: string;
	unitPrice: number;
	stock: number;
	status: Status;
}

export interface OrderLine {
	product: string;
	quantity: number;
	unitPrice: number;
	amount: number;
}

export interface SalesOrderDetail {
	id: ID;
	orderNo: string;
	orderDate: string;
	business: string;
	createdBy: string;
	customer: { name: string; phone: string; email: string; type: string };
	items: OrderLine[];
	payment: {
		status: Status;
		method: string;
		paidAmount: number;
		date: string;
		transactionId: string;
		notes: string;
	};
}

/* ---------- Invoices ---------- */
export interface CustomerInvoice {
	id: ID;
	invoiceNo: string;
	customer: string;
	business: string;
	issueDate: string;
	dueDate: string;
	amount: number;
	status: Status;
}

export interface Payment {
	id: ID;
	paymentNo: string;
	invoiceNo: string;
	customer: string;
	method: string;
	date: string;
	amount: number;
	status: Status;
}

export interface InvoiceHistory {
	id: ID;
	invoiceNo: string;
	customer: string;
	action: string;
	performedBy: string;
	date: string;
	amount: number;
	status: Status;
}

/* ---------- Finance ---------- */
export interface IncomeExpense {
	id: ID;
	refNo: string;
	type: 'Income' | 'Expense';
	category: string;
	business: string;
	date: string;
	amount: number;
	status: Status;
}

export interface Transaction {
	id: ID;
	transactionNo: string;
	account: string;
	type: 'Income' | 'Expense';
	method: string;
	date: string;
	amount: number;
	status: Status;
}

export interface CashFlow {
	labels: string[];
	income: number[];
	expense: number[];
	summary: { income: number; expense: number; net: number };
	byCategory: { label: string; value: number }[];
}

/* ---------- HR & Payroll ---------- */
export interface Employee {
	id: ID;
	employeeNo: string;
	name: string;
	department: string;
	position: string;
	business: string;
	joinDate: string;
	status: Status;
}

export interface Attendance {
	id: ID;
	employee: string;
	department: string;
	date: string;
	checkIn: string;
	checkOut: string;
	hours: string;
	status: Status;
}

export interface LeaveRequest {
	id: ID;
	employee: string;
	leaveType: string;
	from: string;
	to: string;
	days: number;
	reason: string;
	status: Status;
}

export interface PayrollRecord {
	id: ID;
	employeeNo: string;
	employee: string;
	business: string;
	department: string;
	month: string;
	basic: number;
	allowance: number;
	overtime: number;
	bonus: number;
	deduction: number;
	netPay: number;
	paymentDate: string;
	status: Status;
}

/** One salary change for an employee (HR → Salary History). */
export interface SalaryChange {
	id: ID;
	employeeNo: string;
	employee: string;
	business: string;
	department: string;
	previousSalary: number;
	newSalary: number;
	effectiveDate: string;
	reason: string;
	approvedBy: string;
}

export interface Department {
	id: ID;
	name: string;
	head: string;
	business: string;
	employees: number;
	status: Status;
}

/* ---------- Settings ---------- */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve';

export interface Role {
	id: ID;
	name: string;
	description: string;
	users: number;
}

export interface ModulePermission {
	module: string;
	actions: Record<PermissionAction, boolean>;
}

export interface Branch {
	id: ID;
	name: string;
	address: string;
	phone: string;
}

export interface Company {
	id: ID;
	name: string;
	email: string;
	phone: string;
	address: string;
	currency: string;
	timezone: string;
	hasBranches: boolean;
	branches: Branch[];
}

export interface AppUser {
	id: ID;
	name: string;
	email: string;
	phones: string[];
	role: string;
	business: string;
	avatar?: string;
	status: Status;
	lastActive: string;
}

/** Settings → User Management → user detail. Access comes from the role's permission matrix. */
export interface AppUserDetail extends AppUser {
	roleId: ID;
	businesses: string[];
	defaultBusiness: string;
	permissions: ModulePermission[];
}

export interface SecuritySettings {
	twoFactor: boolean;
	loginAlerts: boolean;
	sessionTimeout: string;
	passwordExpiry: string;
}
