import { ENDPOINTS } from '#lib/constants/endpoints.ts';
import type {
	Board,
	BoardAccess,
	BoardDetail,
	BoardMember,
	ChecklistItem,
	ID,
	Task,
	TaskComment,
	TaskDetail,
	TaskList,
	TaskUpdate,
	UserSummary,
	Visibility
} from '#lib/types/index.ts';
import { http } from './http';
import { createResourceService } from './resource.service';

export const boardService = {
	...createResourceService<Board, { title: string; visibility: Visibility }>(ENDPOINTS.boards),
	detail: (id: ID, signal?: AbortSignal) => http.get<BoardDetail>(`${ENDPOINTS.boards}/${id}`, undefined, signal),
	updateBoard: (id: ID, body: { title?: string; visibility?: Visibility }) =>
		http.patch<BoardDetail>(`${ENDPOINTS.boards}/${id}`, body),

	addList: (boardId: ID, title: string) => http.post<TaskList>(`${ENDPOINTS.boards}/${boardId}/lists`, { title }),
	renameList: (listId: ID, title: string) => http.patch<TaskList>(`${ENDPOINTS.taskLists}/${listId}`, { title }),
	deleteList: (listId: ID) => http.delete<void>(`${ENDPOINTS.taskLists}/${listId}`),

	addTask: (listId: ID, title: string) => http.post<Task>(`${ENDPOINTS.taskLists}/${listId}/tasks`, { title }),
	task: (taskId: ID, signal?: AbortSignal) => http.get<TaskDetail>(`${ENDPOINTS.tasks}/${taskId}`, undefined, signal),
	updateTask: (taskId: ID, body: TaskUpdate) => http.patch<TaskDetail>(`${ENDPOINTS.tasks}/${taskId}`, body),
	/** Another list on this board or on another board. */
	/** `position` is top / bottom, or the index to drop at (drag and drop). */
	moveTask: (taskId: ID, listId: ID, position: 'top' | 'bottom' | number = 'bottom') =>
		http.post<TaskDetail>(`${ENDPOINTS.tasks}/${taskId}/move`, { listId, position }),
	copyTask: (taskId: ID) => http.post<Task>(`${ENDPOINTS.tasks}/${taskId}/copy`),
	archiveTask: (taskId: ID) => http.post<void>(`${ENDPOINTS.tasks}/${taskId}/archive`),

	addChecklistItem: (taskId: ID, text: string) =>
		http.post<ChecklistItem>(`${ENDPOINTS.tasks}/${taskId}/checklist`, { text }),
	updateChecklistItem: (itemId: ID, body: { text?: string; done?: boolean }) =>
		http.patch<ChecklistItem>(`${ENDPOINTS.checklistItems}/${itemId}`, body),
	deleteChecklistItem: (itemId: ID) => http.delete<void>(`${ENDPOINTS.checklistItems}/${itemId}`),

	comments: (taskId: ID, signal?: AbortSignal) =>
		http.get<TaskComment[]>(`${ENDPOINTS.tasks}/${taskId}/comments`, undefined, signal),
	addComment: (taskId: ID, body: string) => http.post<TaskComment>(`${ENDPOINTS.tasks}/${taskId}/comments`, { body }),

	/** People who can still be added in "Share Board". */
	candidates: (boardId: ID, search?: string) =>
		http.get<UserSummary[]>(`${ENDPOINTS.boards}/${boardId}/candidates`, { search }),
	share: (boardId: ID, user: string, access: BoardAccess = 'Member') =>
		http.post<BoardMember>(`${ENDPOINTS.boards}/${boardId}/members`, { user, access }),
	updateMember: (memberId: ID, access: BoardAccess) =>
		http.patch<BoardMember>(`${ENDPOINTS.boardMembers}/${memberId}`, { access }),
	removeMember: (memberId: ID) => http.delete<void>(`${ENDPOINTS.boardMembers}/${memberId}`)
};
