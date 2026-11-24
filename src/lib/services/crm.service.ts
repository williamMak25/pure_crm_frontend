import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type {
	ActivityKind,
	Consultant,
	Contact,
	Deal,
	DealActivity,
	DealDetail,
	DealInput,
	DealMessage,
	DealMessageKind,
	DealUpdate,
	ID,
	Lead,
	PipelineStage,
	University,
	UserSummary
} from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

/** Students (Contact List). */
export const contactService = createResourceService<Contact>(ENDPOINTS.contacts);
/** Leads tab. PATCH `{ status: 'New' }` moves a lead into the pipeline. */
export const leadService = createResourceService<Lead>(ENDPOINTS.leads);
export const universityService = createResourceService<University>(ENDPOINTS.universities);
export const consultantService = createResourceService<Consultant>(ENDPOINTS.consultants);

/** The selected company's pipeline (the API scopes it via the X-Company header). */
export const pipelineService = {
	stages: (signal?: AbortSignal) => http.get<PipelineStage[]>(ENDPOINTS.pipeline, undefined, signal),
	createStage: (body: { name: string; color?: string }) =>
		http.post<PipelineStage>(ENDPOINTS.pipeline, body),
	updateStage: (id: ID, body: Partial<Pick<PipelineStage, 'name' | 'color' | 'position'>>) =>
		http.patch<PipelineStage>(`${ENDPOINTS.pipeline}/${id}`, body),
	removeStage: (id: ID) => http.delete<void>(`${ENDPOINTS.pipeline}/${id}`),

	createDeal: (stageId: ID, body: DealInput) => http.post<Deal>(`${ENDPOINTS.pipeline}/${stageId}/deals`, body),
	deal: (id: ID, signal?: AbortSignal) => http.get<DealDetail>(`${ENDPOINTS.deals}/${id}`, undefined, signal),
	/** Also moves a card: pass `stageId` and/or `position`. */
	updateDeal: (id: ID, body: DealUpdate) => http.patch<DealDetail>(`${ENDPOINTS.deals}/${id}`, body),
	removeDeal: (id: ID) => http.delete<void>(`${ENDPOINTS.deals}/${id}`),

	/** Members of the company (Saleperson / Assigned to pickers). */
	people: () => http.get<UserSummary[]>(ENDPOINTS.crmPeople),

	messages: (dealId: ID, query: { kind?: DealMessageKind; search?: string } = {}, signal?: AbortSignal) =>
		http.get<DealMessage[]>(`${ENDPOINTS.deals}/${dealId}/messages`, query, signal),
	createMessage: (dealId: ID, body: { kind: DealMessageKind; body: string; to?: string; subject?: string }) =>
		http.post<DealMessage>(`${ENDPOINTS.deals}/${dealId}/messages`, body),

	activities: (dealId: ID, signal?: AbortSignal) =>
		http.get<DealActivity[]>(`${ENDPOINTS.deals}/${dealId}/activities`, undefined, signal),
	createActivity: (dealId: ID, body: { kind: ActivityKind; summary?: string; dueDate?: string; assignedTo?: string }) =>
		http.post<DealActivity>(`${ENDPOINTS.deals}/${dealId}/activities`, body),
	updateActivity: (id: ID, body: { done?: boolean }) => http.patch<DealActivity>(`${ENDPOINTS.dealActivities}/${id}`, body),
	removeActivity: (id: ID) => http.delete<void>(`${ENDPOINTS.dealActivities}/${id}`)
};
