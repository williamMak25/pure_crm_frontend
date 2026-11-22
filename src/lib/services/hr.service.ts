import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type { Attendance, Department, Employee, LeaveRequest, PayrollRecord, SalaryChange } from '#lib/types/index.ts';
import { createResourceService } from './resource.service';

export const employeeService = createResourceService<Employee>(ENDPOINTS.employees);
export const attendanceService = createResourceService<Attendance>(ENDPOINTS.attendance);
export const leaveService = createResourceService<LeaveRequest>(ENDPOINTS.leaves);
export const payrollService = createResourceService<PayrollRecord>(ENDPOINTS.payroll);
export const salaryHistoryService = createResourceService<SalaryChange>(ENDPOINTS.salaryHistory);
export const departmentService = createResourceService<Department>(ENDPOINTS.departments);
