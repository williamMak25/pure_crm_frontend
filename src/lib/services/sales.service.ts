import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { ID, Product, Quotation, QuotationDetail, SalesOrder, SalesOrderDetail } from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

export const salesOrderService = {
	...createResourceService<SalesOrder>(ENDPOINTS.salesOrders),
	detail: (id: ID) => http.get<SalesOrderDetail>(`${ENDPOINTS.salesOrders}/${id}`)
};
export const quotationService = {
	...createResourceService<Quotation>(ENDPOINTS.quotations),
	detail: (id: ID) => http.get<QuotationDetail>(`${ENDPOINTS.quotations}/${id}`)
};
export const productService = createResourceService<Product>(ENDPOINTS.products);
