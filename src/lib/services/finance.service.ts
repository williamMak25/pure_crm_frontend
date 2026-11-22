import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { CashFlow, IncomeExpense, Transaction, TrendRange } from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

export const incomeExpenseService = createResourceService<IncomeExpense>(ENDPOINTS.incomeExpenses);
export const transactionService = createResourceService<Transaction>(ENDPOINTS.transactions);
export const cashFlowService = {
	get: (range: TrendRange) => http.get<CashFlow>(ENDPOINTS.cashFlow, { range })
};
