import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { boardService } from '#lib/services/index.ts';
import type { BoardAccess, BoardDetail, ID, ListParams, TaskUpdate, Visibility } from '#lib/types/index.ts';
import { queryKeys } from './keys';
import { createListQuery } from './resource';

export const BOARDS = 'boards';

export const createBoardsQuery = (params: () => ListParams) =>
	createListQuery(() => ({ name: BOARDS, service: boardService, params: params() }));

// Each options function reads its id once: queries sharing a key may run whichever observer's
// queryFn was set last, so the closure must not look the id up again at fetch time.
export const createBoardDetailQuery = (id: () => ID | null | undefined) =>
	createQuery(() => {
		const boardId = id();
		return {
			queryKey: queryKeys.boards.detail(boardId ?? ''),
			queryFn: ({ signal }: { signal: AbortSignal }) => boardService.detail(boardId!, signal),
			enabled: !!boardId
		};
	});

export const createTaskQuery = (id: () => ID | null) =>
	createQuery(() => {
		const taskId = id();
		return {
			queryKey: queryKeys.boards.task(taskId ?? ''),
			queryFn: ({ signal }: { signal: AbortSignal }) => boardService.task(taskId!, signal),
			enabled: !!taskId
		};
	});

export const createTaskCommentsQuery = (id: () => ID | null) =>
	createQuery(() => {
		const taskId = id();
		return {
			queryKey: queryKeys.boards.comments(taskId ?? ''),
			queryFn: ({ signal }: { signal: AbortSignal }) => boardService.comments(taskId!, signal),
			enabled: !!taskId
		};
	});

export const createBoardCandidatesQuery = (id: () => ID, enabled: () => boolean) =>
	createQuery(() => {
		const boardId = id();
		return {
			queryKey: queryKeys.boards.candidates(boardId),
			queryFn: () => boardService.candidates(boardId),
			enabled: !!boardId && enabled()
		};
	});

export function createCreateBoardMutation(onDone?: () => void) {
	const client = useQueryClient();
	return createMutation(() => ({
		mutationFn: boardService.create,
		onSuccess: () => {
			client.invalidateQueries({ queryKey: queryKeys.resource.all(BOARDS) });
			toast.success('Board created');
			onDone?.();
		},
		onError: (e: Error) => toast.error(e.message)
	}));
}

/**
 * Every board and card mutation. Each one refreshes the board(s), the open card and the board list
 * (task counts / status there come from the cards).
 */
export function createBoardMutations(boardId: () => ID) {
	const client = useQueryClient();
	const refresh = () => {
		client.invalidateQueries({ queryKey: queryKeys.boards.all });
		client.invalidateQueries({ queryKey: queryKeys.resource.all(BOARDS) });
	};
	function mutation<V, R>(fn: (v: V) => Promise<R>, success?: string) {
		return createMutation(() => ({
			mutationFn: fn,
			onSuccess: () => {
				refresh();
				if (success) toast.success(success);
			},
			onError: (e: Error) => toast.error(e.message)
		}));
	}

	return {
		addList: mutation((title: string) => boardService.addList(boardId(), title), 'Task list added'),
		renameList: mutation(({ listId, title }: { listId: ID; title: string }) => boardService.renameList(listId, title), 'List renamed'),
		deleteList: mutation((listId: ID) => boardService.deleteList(listId), 'List deleted'),
		addTask: mutation(({ listId, title }: { listId: ID; title: string }) => boardService.addTask(listId, title)),
		updateTask: mutation(({ taskId, body }: { taskId: ID; body: TaskUpdate }) => boardService.updateTask(taskId, body)),
		copyTask: mutation((taskId: ID) => boardService.copyTask(taskId), 'Card copied'),
		archiveTask: mutation((taskId: ID) => boardService.archiveTask(taskId), 'Card archived'),
		moveTask: createMutation(() => ({
			mutationFn: ({ taskId, toListId, position }: { taskId: ID; toListId: ID; position?: 'top' | 'bottom' | number }) =>
				boardService.moveTask(taskId, toListId, position),
			// Optimistic move within this board so the card lands where it was dropped immediately.
			onMutate: async ({ taskId, toListId, position = 'bottom' }) => {
				const key = queryKeys.boards.detail(boardId());
				await client.cancelQueries({ queryKey: key });
				const prev = client.getQueryData<BoardDetail>(key);
				const task = prev?.lists.flatMap((l) => l.tasks).find((t) => t.id === taskId);
				if (prev && task) {
					client.setQueryData<BoardDetail>(key, {
						...prev,
						lists: prev.lists.map((l) => {
							const rest = l.tasks.filter((t) => t.id !== taskId);
							if (l.id !== toListId) return { ...l, tasks: rest };
							const at = position === 'top' ? 0 : position === 'bottom' ? rest.length : Math.min(position, rest.length);
							return { ...l, tasks: [...rest.slice(0, at), { ...task, listId: toListId }, ...rest.slice(at)] };
						})
					});
				}
				return { prev };
			},
			onError: (e: Error, _v, ctx) => {
				if (ctx?.prev) client.setQueryData(queryKeys.boards.detail(boardId()), ctx.prev);
				toast.error(e.message);
			},
			onSuccess: (_d, { position }) => {
				// Dropping a card is its own confirmation; menus get a toast.
				if (typeof position !== 'number') toast.success('Card moved');
			},
			onSettled: refresh
		})),
		addChecklistItem: mutation(({ taskId, text }: { taskId: ID; text: string }) => boardService.addChecklistItem(taskId, text)),
		toggleChecklistItem: mutation(({ itemId, done }: { itemId: ID; done: boolean }) => boardService.updateChecklistItem(itemId, { done })),
		deleteChecklistItem: mutation((itemId: ID) => boardService.deleteChecklistItem(itemId)),
		addComment: mutation(({ taskId, body }: { taskId: ID; body: string }) => boardService.addComment(taskId, body)),
		share: mutation(({ user, access }: { user: string; access: BoardAccess }) => boardService.share(boardId(), user, access), 'Added to the board'),
		updateMember: mutation(({ memberId, access }: { memberId: ID; access: BoardAccess }) => boardService.updateMember(memberId, access), 'Access updated'),
		removeMember: mutation((memberId: ID) => boardService.removeMember(memberId), 'Removed from the board'),
		setVisibility: mutation((visibility: Visibility) => boardService.updateBoard(boardId(), { visibility }), 'Visibility updated')
	};
}

export type BoardMutations = ReturnType<typeof createBoardMutations>;
