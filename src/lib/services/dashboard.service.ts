import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { Activity, AttentionItem, OutstandingPayment, SaleInvoiceRow, StatSummary, TrendRange, TrendSeries, WorkItem } from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

export const dashboardService = {
	summary: (business?: string) => http.get<StatSummary[]>(ENDPOINTS.dashboardSummary, { business }),
	trend: (range: TrendRange, business?: string) =>
		http.get<TrendSeries>(ENDPOINTS.dashboardTrend, { range, business }),
	activities: () => http.get<Activity[]>(ENDPOINTS.dashboardActivities),
	outstanding: () => http.get<OutstandingPayment[]>(ENDPOINTS.dashboardOutstanding),
	upcoming: () => http.get<WorkItem[]>(ENDPOINTS.dashboardUpcoming),
	attention: () => http.get<AttentionItem[]>(ENDPOINTS.dashboardAttention),
	recentSales: createResourceService<SaleInvoiceRow>(ENDPOINTS.dashboardRecentSales)
};
