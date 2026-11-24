/**
 * Field schemas for every "Add New …" drawer in the Figma file (564px, two
 * 252px columns, Cancel / Save footer). Keys map 1:1 to API payload fields.
 */
export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';

export interface FormField {
	name: string;
	label: string;
	type?: FieldType;
	placeholder?: string;
	required?: boolean;
	options?: string[];
	/** Span both columns (textareas, long inputs). */
	full?: boolean;
	/** Options loaded at runtime instead of `options`: the business units from the API. */
	source?: 'businesses';
}

const PAYMENT_METHODS = ['KBZ Pay', 'Wave Pay', 'AYA Pay', 'Cash', 'Bank Transfer'];
const business = (): FormField => ({ name: 'business', label: 'Business', type: 'select', source: 'businesses', required: true });
const status = (options: string[]): FormField => ({ name: 'status', label: 'Status', type: 'select', options });

export const FORMS = {
	contact: [
		{ name: 'name', label: 'Contact Name', required: true, placeholder: 'Enter contact name' },
		{ name: 'company', label: 'Company', required: true, placeholder: 'Enter company' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '09 xxx xxx xxx' },
		{ name: 'owner', label: 'Assigned Owner', placeholder: "User's full name (blank = you)" },
		{ name: 'followUpDate', label: 'Follow-up Date', type: 'date' },
		status(['Active', 'Inactive', 'Archived']),
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Add a note' }
	],
	/** Leads tab. Choosing "New" sends the lead straight into the pipeline. */
	lead: [
		{ name: 'name', label: 'Lead Name', required: true, placeholder: 'Enter lead name' },
		{ name: 'company', label: 'Company', placeholder: 'Enter company' },
		{ name: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '09 xxx xxx xxx' },
		{ name: 'owner', label: 'Assigned Owner', placeholder: "User's full name (blank = you)" },
		{ name: 'followUpDate', label: 'Follow-up Date', type: 'date' },
		status(['Open', 'Contacted', 'New', 'Lost']),
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Where did this lead come from?' }
	],
	pipeline: [{ name: 'name', label: 'Stage Name', required: true, placeholder: 'e.g. Proposal', full: true }],
	university: [
		{ name: 'name', label: 'University Name', required: true, placeholder: 'Enter university name' },
		{ name: 'country', label: 'Country', required: true, placeholder: 'Enter country' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' },
		status(['Active', 'Pending', 'Inactive']),
		{ name: 'website', label: 'Website', placeholder: 'https://', full: true }
	],
	consultant: [
		{ name: 'name', label: 'Consultant Name', required: true, placeholder: 'Enter consultant name' },
		{ name: 'company', label: 'Company', required: true, placeholder: 'Enter company' },
		{ name: 'country', label: 'Country', required: true, placeholder: 'Enter country' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number' },
		status(['Active', 'Inactive'])
	],
	order: [
		{ name: 'customer', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '09 xxx xxx xxx' },
		{ name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@example.com' },
		{ name: 'customerType', label: 'Customer Type', type: 'select', options: ['Individual', 'Company'] },
		business(),
		{ name: 'date', label: 'Order Date', type: 'date', required: true },
		{ name: 'product', label: 'Product', required: true, placeholder: 'Select or enter product' },
		{ name: 'quantity', label: 'Quantity', type: 'number', required: true, placeholder: '1' },
		{ name: 'unitPrice', label: 'Unit Price', type: 'number', required: true, placeholder: '0' },
		{ name: 'paymentMethod', label: 'Payment Method', type: 'select', options: PAYMENT_METHODS }
	],
	quotation: [
		{ name: 'customer', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
		business(),
		{ name: 'date', label: 'Quotation Date', type: 'date', required: true },
		{ name: 'validUntil', label: 'Valid Until', type: 'date', required: true },
		{ name: 'product', label: 'Item', required: true, placeholder: 'Enter item' },
		{ name: 'quantity', label: 'Quantity', type: 'number', required: true, placeholder: '1' },
		{ name: 'unitPrice', label: 'Unit Price', type: 'number', required: true, placeholder: '0' },
		{ name: 'discount', label: 'Discount (%)', type: 'number', placeholder: '0' },
		status(['Draft', 'Sent', 'Accepted', 'Rejected']),
		{ name: 'notes', label: 'Notes', placeholder: 'Optional note' }
	],
	item: [
		{ name: 'name', label: 'Item Name', required: true, placeholder: 'Enter item name' },
		{ name: 'code', label: 'Item Code', required: true, placeholder: 'ITM-000' },
		{ name: 'category', label: 'Category', type: 'select', required: true, options: ['Course', 'Service', 'Merchandise'] },
		business(),
		{ name: 'unitPrice', label: 'Unit Price', type: 'number', required: true, placeholder: '0' },
		{ name: 'stock', label: 'Stock Quantity', type: 'number', placeholder: '0' },
		{ name: 'unit', label: 'Unit', type: 'select', options: ['Seat', 'Piece', 'Package', 'Hour'] },
		status(['Active', 'Inactive']),
		{ name: 'description', label: 'Description', type: 'textarea', full: true, placeholder: 'Describe the item' }
	],
	customerInvoice: [
		{ name: 'customer', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
		business(),
		{ name: 'issueDate', label: 'Invoice Date', type: 'date', required: true },
		{ name: 'dueDate', label: 'Due Date', type: 'date', required: true },
		{ name: 'orderNo', label: 'Order ID', placeholder: 'SO-000' },
		{ name: 'product', label: 'Item', placeholder: 'Enter item' },
		{ name: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
		{ name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
		{ name: 'tax', label: 'Tax (%)', type: 'number', placeholder: '0' },
		status(['Unpaid', 'Pending', 'Paid', 'Overdue']),
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Payment terms or notes' }
	],
	payment: [
		{ name: 'invoiceNo', label: 'Invoice No', required: true, placeholder: 'INV-000' },
		{ name: 'customer', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
		{ name: 'date', label: 'Payment Date', type: 'date', required: true },
		{ name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
		{ name: 'method', label: 'Payment Method', type: 'select', required: true, options: PAYMENT_METHODS },
		{ name: 'transactionId', label: 'Transaction ID', placeholder: 'KP-00000000' },
		{ name: 'account', label: 'Deposit Account', placeholder: 'Enter account' },
		business(),
		status(['Paid', 'Pending', 'Rejected']),
		{ name: 'receivedBy', label: 'Received By', placeholder: 'Enter name' },
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Optional note' }
	],
	invoiceHistory: [
		{ name: 'invoiceNo', label: 'Invoice No', required: true, placeholder: 'INV-000' },
		{ name: 'customer', label: 'Customer Name', required: true, placeholder: 'Enter customer name' },
		{ name: 'action', label: 'Action', type: 'select', required: true, options: ['Created', 'Sent', 'Payment received', 'Reminder sent', 'Marked overdue'] },
		{ name: 'performedBy', label: 'Performed By', placeholder: 'Enter name' },
		{ name: 'date', label: 'Date', type: 'date', required: true },
		{ name: 'amount', label: 'Amount', type: 'number', placeholder: '0' },
		status(['Draft', 'Sent', 'Paid', 'Pending', 'Overdue']),
		business(),
		{ name: 'reference', label: 'Reference', placeholder: 'Optional reference' },
		{ name: 'notes', label: 'Notes', placeholder: 'Optional note' }
	],
	incomeExpense: [
		{ name: 'type', label: 'Type', type: 'select', required: true, options: ['Income', 'Expense'] },
		{ name: 'category', label: 'Category', type: 'select', required: true, options: ['Course Fees', 'Consultation', 'Merchandise', 'Salary', 'Rent', 'Utilities', 'Marketing'] },
		business(),
		{ name: 'date', label: 'Date', type: 'date', required: true },
		{ name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
		{ name: 'method', label: 'Payment Method', type: 'select', options: PAYMENT_METHODS },
		{ name: 'refNo', label: 'Reference No', placeholder: 'FIN-000' },
		status(['Pending', 'Approved', 'Rejected']),
		{ name: 'description', label: 'Description', type: 'textarea', full: true, placeholder: 'Describe the entry' }
	],
	transaction: [
		{ name: 'account', label: 'Account', required: true, placeholder: 'e.g. KBZ Bank - 0012' },
		{ name: 'type', label: 'Type', type: 'select', required: true, options: ['Income', 'Expense'] },
		{ name: 'method', label: 'Payment Method', type: 'select', required: true, options: PAYMENT_METHODS },
		{ name: 'date', label: 'Transaction Date', type: 'date', required: true },
		{ name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0' },
		{ name: 'reference', label: 'Reference', placeholder: 'Optional reference' },
		business(),
		status(['Pending', 'Completed', 'Rejected']),
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Optional note' }
	],
	employee: [
		{ name: 'name', label: 'Full Name', required: true, placeholder: 'Enter full name' },
		{ name: 'employeeNo', label: 'Employee ID', required: true, placeholder: 'EMP-000' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '09 xxx xxx xxx' },
		{ name: 'department', label: 'Department', type: 'select', required: true, options: ['Sales', 'Finance', 'Marketing', 'Operations', 'Academic'] },
		{ name: 'position', label: 'Position', required: true, placeholder: 'Enter position' },
		business(),
		{ name: 'joinDate', label: 'Join Date', type: 'date', required: true },
		{ name: 'salary', label: 'Basic Salary', type: 'number', placeholder: '0' },
		status(['Active', 'On Leave', 'Inactive'])
	],
	attendance: [
		{ name: 'employee', label: 'Employee', required: true, placeholder: 'Enter employee name' },
		{ name: 'date', label: 'Date', type: 'date', required: true },
		{ name: 'checkIn', label: 'Check In', placeholder: '09:00 AM' },
		{ name: 'checkOut', label: 'Check Out', placeholder: '05:30 PM' },
		status(['Present', 'Late', 'Absent', 'On Leave']),
		{ name: 'notes', label: 'Notes', placeholder: 'Optional note' }
	],
	leave: [
		{ name: 'employee', label: 'Employee', required: true, placeholder: 'Enter employee name' },
		{ name: 'leaveType', label: 'Leave Type', type: 'select', required: true, options: ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'] },
		{ name: 'from', label: 'From', type: 'date', required: true },
		{ name: 'to', label: 'To', type: 'date', required: true },
		{ name: 'reason', label: 'Reason', type: 'textarea', full: true, required: true, placeholder: 'Reason for leave' }
	],
	payroll: [
		{ name: 'employee', label: 'Employee', required: true, placeholder: 'Enter employee name' },
		{ name: 'month', label: 'Pay Month', required: true, placeholder: 'October 2026' },
		{ name: 'basic', label: 'Basic Salary', type: 'number', required: true, placeholder: '0' },
		{ name: 'allowance', label: 'Allowances', type: 'number', placeholder: '0' },
		{ name: 'overtime', label: 'Overtime', type: 'number', placeholder: '0' },
		{ name: 'bonus', label: 'Bonus', type: 'number', placeholder: '0' },
		{ name: 'deduction', label: 'Deductions', type: 'number', placeholder: '0' },
		{ name: 'paymentDate', label: 'Payment Date', type: 'date' },
		{ name: 'method', label: 'Payment Method', type: 'select', options: PAYMENT_METHODS },
		status(['Draft', 'Pending', 'Paid'])
	],
	salaryChange: [
		{ name: 'employee', label: 'Employee', required: true, placeholder: 'Enter employee name' },
		{ name: 'newSalary', label: 'New Salary', type: 'number', required: true, placeholder: '0' },
		{ name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
		{ name: 'reason', label: 'Reason', type: 'select', required: true, options: ['Annual increment', 'Promotion', 'Adjustment', 'Probation passed'] },
		{ name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Optional note' }
	],
	department: [
		{ name: 'name', label: 'Department Name', required: true, placeholder: 'Enter department name' },
		{ name: 'head', label: 'Department Head', placeholder: 'Enter name' },
		business(),
		status(['Active', 'Inactive'])
	],
	user: [
		{ name: 'name', label: 'Full Name', required: true, placeholder: 'Enter full name' },
		{ name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
		// Role options are the selected company's roles, filled in by the users page.
		{ name: 'role', label: 'Role', type: 'select', required: true, options: [] },
		{ name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '09 xxx xxx xxx' },
		status(['Active', 'Inactive'])
	]
} satisfies Record<string, FormField[]>;

export type FormKey = keyof typeof FORMS;
