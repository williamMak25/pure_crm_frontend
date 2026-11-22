import type { BoardMember, Task } from '#lib/types/index.ts';

/** Figma "Filter" drawer. Within a section any ticked option matches; sections combine with AND. */
export type FilterKey = 'members' | 'status' | 'due' | 'labels' | 'activity';
export type BoardFilters = { keyword: string } & Record<FilterKey, string[]>;
export type FilterSection = { key: FilterKey; label: string; options: { value: string; label: string }[] };

export const emptyFilters = (): BoardFilters => ({ keyword: '', members: [], status: [], due: [], labels: [], activity: [] });

export const activeFilterCount = (f: BoardFilters) =>
	(f.keyword ? 1 : 0) + f.members.length + f.status.length + f.due.length + f.labels.length + f.activity.length;

/** Options come from the board itself: its members and the labels used on its cards. */
export function filterSections(members: BoardMember[], labels: string[], meId?: string): FilterSection[] {
	return [
		{
			key: 'members',
			label: 'Members',
			options: [
				{ value: 'none', label: 'No members' },
				...(meId ? [{ value: meId, label: 'Assigned to me' }] : []),
				...members.filter((m) => m.id !== meId).map((m) => ({ value: m.id, label: m.name }))
			]
		},
		{
			key: 'status',
			label: 'Card Status',
			options: [
				{ value: 'done', label: 'Marked as complete' },
				{ value: 'open', label: 'Not marked as complete' }
			]
		},
		{
			key: 'due',
			label: 'Due Date',
			options: [
				{ value: 'none', label: 'No dates' },
				{ value: 'overdue', label: 'Overdue' },
				{ value: 'day', label: 'Due in the next day' },
				{ value: 'week', label: 'Due in the next week' },
				{ value: 'month', label: 'Due in the next month' }
			]
		},
		{
			key: 'labels',
			label: 'Labels',
			options: [{ value: 'none', label: 'No labels' }, ...labels.map((l) => ({ value: l, label: l }))]
		},
		{
			key: 'activity',
			label: 'Activity',
			options: [
				{ value: '7', label: 'Active in the last week' },
				{ value: '14', label: 'Active in the last two weeks' },
				{ value: '28', label: 'Active in the last four weeks' },
				{ value: 'stale', label: 'Without activity in the last four weeks' }
			]
		}
	];
}

const DAY = 86_400_000;

export function matchesFilters(task: Task, f: BoardFilters, search: string, now = Date.now()) {
	const q = (search || f.keyword).trim().toLowerCase();
	if (q && !task.title.toLowerCase().includes(q) && !task.labels.some((l) => l.toLowerCase().includes(q))) return false;

	const any = (values: string[], test: (v: string) => boolean) => !values.length || values.some(test);

	if (!any(f.members, (v) => (v === 'none' ? !task.members.length : task.members.some((m) => m.id === v)))) return false;
	if (!any(f.status, (v) => (v === 'done' ? task.completed : !task.completed))) return false;

	const due = task.dueDate ? new Date(`${task.dueDate}T23:59:59`).getTime() : null;
	const dueTests: Record<string, () => boolean> = {
		none: () => due === null,
		overdue: () => due !== null && due < now && !task.completed,
		day: () => due !== null && due >= now && due - now <= DAY,
		week: () => due !== null && due >= now && due - now <= 7 * DAY,
		month: () => due !== null && due >= now && due - now <= 31 * DAY
	};
	if (!any(f.due, (v) => dueTests[v]?.() ?? true)) return false;

	if (!any(f.labels, (v) => (v === 'none' ? !task.labels.length : task.labels.includes(v)))) return false;

	const idle = now - new Date(task.updatedAt).getTime();
	if (!any(f.activity, (v) => (v === 'stale' ? idle > 28 * DAY : idle <= Number(v) * DAY))) return false;
	return true;
}
