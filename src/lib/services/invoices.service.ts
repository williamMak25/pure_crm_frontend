import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { CustomerInvoice, InvoiceHistory, Payment } from '#lib/types/index.ts';
import { createResourceService } from './resource.service';

export const customerInvoiceService = createResourceService<CustomerInvoice>(ENDPOINTS.customerInvoices);
export const paymentService = createResourceService<Payment>(ENDPOINTS.payments);
export const invoiceHistoryService = createResourceService<InvoiceHistory>(ENDPOINTS.invoiceHistory);
