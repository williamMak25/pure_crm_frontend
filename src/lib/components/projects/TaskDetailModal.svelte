<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createTaskCommentsQuery, createTaskQuery, type BoardMutations } from '#lib/queries/projects.ts';
	import type { BoardMember, TaskDetail, TaskList, TaskUpdate } from '#lib/types/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { formatDate } from '#lib/utils/format.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Button from '../ui/button/Button.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import type { IconName } from '#lib/constants/icons.ts';
	import LazyImage from '../ui/image/LazyImage.svelte';
	import Modal from '../ui/modal/Modal.svelte';
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
	import ErrorState from '../ui/state/ErrorState.svelte';

	// Figma "Component 2": the open card. Title, list picker, cover / more / comments / close,
	// then Add · Labels · Dates · Checklist · Members and the description.
	export type CardPanel = 'labels' | 'dates' | 'checklist' | 'members' | 'cover' | null;
	interface Props {
		taskId: string | null;
		lists: TaskList[];
		members: BoardMember[];
		/** Labels already used on this board, offered as suggestions. */
		boardLabels: string[];
		mutations: BoardMutations;
		/** Opened from a card action ("Edit labels", "Edit dates"…). */
		initialPanel?: CardPanel;
		onmoveboard: () => void;
		onclose: () => void;
	}
	let { taskId, lists, members, boardLabels, mutations, initialPanel = null, onmoveboard, onclose }: Props = $props();

	const task = createTaskQuery(() => taskId);
	let showComments = $state(false);
	const comments = createTaskCommentsQuery(() => (taskId && showComments ? taskId : null));

	let pickedPanel = $state<CardPanel | undefined>(undefined);
	const panel = $derived(pickedPanel === undefined ? initialPanel : pickedPanel);
	const togglePanel = (p: CardPanel) => (pickedPanel = panel === p ? null : p);

	let editingTitle = $state(false);
	let titleDraft = $state('');
	let descDraft = $state<string | null>(null);
	let labelDraft = $state('');
	let coverDraft = $state('');
	let checkDraft = $state('');
	let commentDraft = $state('');

	function close() {
		pickedPanel = undefined;
		showComments = editingTitle = false;
		descDraft = null;
		labelDraft = coverDraft = checkDraft = commentDraft = '';
		onclose();
	}

	const save = (t: TaskDetail, body: TaskUpdate) => mutations.updateTask.mutateAsync({ taskId: t.id, body }).catch(() => {});

	function addLabel(t: TaskDetail, raw = labelDraft) {
		const label = raw.trim();
		if (label && !t.labels.includes(label)) save(t, { labels: [...t.labels, label] });
		labelDraft = '';
	}
	const toggleMember = (t: TaskDetail, id: string) => {
		const ids = t.members.map((m) => m.id);
		save(t, { memberIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
	};

	const ACTIONS: { panel: Exclude<CardPanel, null | 'cover'>; label: string; icon: IconName }[] = [
		{ panel: 'labels', label: 'Labels', icon: 'tag' },
		{ panel: 'dates', label: 'Dates', icon: 'clock' },
		{ panel: 'checklist', label: 'Checklist', icon: 'checkSquare' },
		{ panel: 'members', label: 'Members', icon: 'user' }
	];

	function onmore(t: TaskDetail, v: string) {
		if (v === 'complete') save(t, { completed: !t.completed });
		else if (v === 'copy') mutations.copyTask.mutate(t.id);
		else if (v === 'move') onmoveboard();
		else if (v === 'link') {
			navigator.clipboard?.writeText(`${location.origin}/projects/${t.boardId}?card=${t.id}`);
			toast.success('Card link copied');
		} else if (v === 'archive') {
			mutations.archiveTask.mutate(t.id);
			close();
		}
	}

	const timeLabel = (iso: string) =>
		new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	const chip = 'inline-flex h-[38px] items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50';
	const iconBtn = 'grid size-[38px] place-items-center rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50';
	const panelBox = 'flex flex-col gap-3 rounded-lg border border-neutral-200 p-3';
</script>

<Modal open={!!taskId} width={660} onclose={close}>
	{#if task.isPending}
		<div class="flex flex-col gap-4" aria-busy="true"><Skeleton width="60%" height="28px" /><Skeleton height="38px" /><Skeleton height="140px" rounded="lg" /></div>
	{:else if task.isError}
		<ErrorState error={task.error} onretry={() => task.refetch()} />
	{:else}
		{@const t = task.data}
		{@const editable = t.canEdit}
		<div class="flex flex-col gap-5">
			{#if t.cover}<LazyImage src={t.cover} alt="" aspect="16 / 6" class="rounded-lg" />{/if}

			<!-- Header -->
			<div class="flex flex-wrap items-center gap-3">
				<button
					type="button"
					class={cn('grid size-6 shrink-0 place-items-center rounded-full border', t.completed ? 'border-green-500 bg-green-500 text-white' : 'border-neutral-300 text-transparent hover:text-neutral-400')}
					aria-pressed={t.completed}
					aria-label={t.completed ? 'Mark as not complete' : 'Mark as complete'}
					disabled={!editable}
					onclick={() => save(t, { completed: !t.completed })}
				>
					<Icon name="check" size={14} />
				</button>
				{#if editingTitle}
					<form
						class="min-w-0 flex-1"
						onsubmit={(e) => {
							e.preventDefault();
							if (titleDraft.trim() && titleDraft.trim() !== t.title) save(t, { title: titleDraft.trim() });
							editingTitle = false;
						}}
					>
						<!-- svelte-ignore a11y_autofocus -->
						<input bind:value={titleDraft} autofocus aria-label="Card title" class="h-10 w-full rounded-md border border-brand-500 px-2 text-xl text-neutral-800 outline-none" onblur={(e) => e.currentTarget.form?.requestSubmit()} />
					</form>
				{:else}
					<button type="button" class="min-w-0 text-left text-xl text-neutral-800 disabled:cursor-default" disabled={!editable} onclick={() => ((titleDraft = t.title), (editingTitle = true))}>
						<h2 class="truncate">{t.title}</h2>
					</button>
				{/if}
				<Dropdown
					items={lists.map((l) => ({ value: l.id, label: l.title }))}
					selected={t.listId}
					placement="bottom-start"
					onselect={(v) => v !== t.listId && mutations.moveTask.mutate({ taskId: t.id, toListId: v })}
					triggerLabel="Move to list (now {t.listTitle})"
					triggerClass="inline-flex h-[38px] items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm text-neutral-700 hover:bg-neutral-50"
				>
					{#snippet trigger()}{t.listTitle}<Icon name="chevronDown" size={18} class="text-brand-600" />{/snippet}
				</Dropdown>
				<div class="ml-auto flex items-center gap-2">
					<button type="button" class={iconBtn} aria-label="Change cover" disabled={!editable} onclick={() => togglePanel('cover')}><Icon name="image" size={20} /></button>
					<Dropdown
						items={[
							{ value: 'complete', label: t.completed ? 'Mark as not complete' : 'Mark as complete', icon: 'checkCircle', disabled: !editable },
							{ value: 'move', label: 'Move', icon: 'arrowRight', disabled: !editable },
							{ value: 'copy', label: 'Copy card', icon: 'copy', disabled: !editable },
							{ value: 'link', label: 'Copy link', icon: 'link' },
							{ value: 'archive', label: 'Archive', icon: 'archive', danger: true, disabled: !editable }
						]}
						onselect={(v) => onmore(t, v)}
						triggerLabel="More card actions"
						triggerClass={iconBtn}
					>
						{#snippet trigger()}<Icon name="more" size={20} />{/snippet}
					</Dropdown>
					<button type="button" class={cn(iconBtn, showComments && 'border-brand-500 text-brand-600')} aria-pressed={showComments} aria-label="Comments" onclick={() => (showComments = !showComments)}>
						<Icon name="inbox" size={20} />
					</button>
					<button type="button" class="grid size-[38px] place-items-center text-brand-600" aria-label="Close" onclick={close}><Icon name="close" size={22} /></button>
				</div>
			</div>

			<!-- Add · Labels · Dates · Checklist · Members -->
			{#if editable}
				<div class="flex flex-wrap gap-3">
					<Dropdown items={ACTIONS.map((a) => ({ value: a.panel, label: a.label, icon: a.icon }))} placement="bottom-start" onselect={(v) => togglePanel(v as CardPanel)} triggerLabel="Add to card" triggerClass={chip}>
						{#snippet trigger()}<Icon name="plus" size={18} />Add{/snippet}
					</Dropdown>
					{#each ACTIONS as a (a.panel)}
						<button type="button" class={cn(chip, panel === a.panel && 'border-brand-500 text-brand-600')} aria-expanded={panel === a.panel} onclick={() => togglePanel(a.panel)}>
							<Icon name={a.icon} size={18} />{a.label}
						</button>
					{/each}
				</div>
			{/if}

			{#if panel === 'cover' && editable}
				<div class={panelBox}>
					<h3 class="text-sm font-medium text-neutral-800">Cover</h3>
					<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), coverDraft.trim() && save(t, { cover: coverDraft.trim() }), (coverDraft = ''))}>
						<input bind:value={coverDraft} placeholder="Image URL (https://…)" aria-label="Cover image URL" class="h-[38px] flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500" />
						<Button type="submit" size="md" disabled={!coverDraft.trim()}>Set</Button>
					</form>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" onclick={() => save(t, { cover: '/images/task-cover.png' })}>Use sample image</Button>
						{#if t.cover}<Button variant="outline-brand" size="sm" onclick={() => save(t, { cover: null })}>Remove cover</Button>{/if}
					</div>
				</div>
			{/if}

			{#if panel === 'labels' && editable}
				<div class={panelBox}>
					<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), addLabel(t))}>
						<input bind:value={labelDraft} placeholder="New label" aria-label="New label" list="board-labels" class="h-[38px] flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500" />
						<datalist id="board-labels">{#each boardLabels.filter((l) => !t.labels.includes(l)) as l (l)}<option value={l}></option>{/each}</datalist>
						<Button type="submit" size="md" icon="plus" disabled={!labelDraft.trim()}>Add</Button>
					</form>
				</div>
			{/if}

			{#if panel === 'dates' && editable}
				<div class={panelBox}>
					<label class="flex flex-col gap-1.5 text-sm text-neutral-800">Due date
						<input type="date" value={t.dueDate ?? ''} class="h-[38px] rounded-md border border-neutral-200 px-3 text-sm" onchange={(e) => save(t, { dueDate: e.currentTarget.value || null })} />
					</label>
					{#if t.dueDate}<Button variant="outline-brand" size="sm" class="self-start" onclick={() => save(t, { dueDate: null })}>Remove date</Button>{/if}
				</div>
			{/if}

			{#if panel === 'members' && editable}
				<div class={panelBox}>
					<h3 class="text-sm font-medium text-neutral-800">Board members</h3>
					<ul class="flex flex-col gap-1">
						{#each members as m (m.id)}
							{@const on = t.members.some((x) => x.id === m.id)}
							<li>
								<button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-50" aria-pressed={on} onclick={() => toggleMember(t, m.id)}>
									<Avatar src={m.avatar} name={m.name} size={28} /><span class="flex-1">{m.name}</span>
									{#if on}<Icon name="check" size={18} class="text-brand-600" />{/if}
								</button>
							</li>
						{/each}
					</ul>
					<p class="text-xs text-neutral-500">Only people on the board can be added. Use Share to invite others.</p>
				</div>
			{/if}

			<!-- Current values -->
			{#if t.members.length || t.labels.length || t.dueDate}
				<div class="flex flex-wrap gap-6">
					{#if t.members.length}
						<div class="flex flex-col gap-1.5"><span class="text-xs text-neutral-500">Members</span>
							<div class="flex -space-x-1.5">{#each t.members as m (m.id)}<Avatar src={m.avatar} name={m.name} size={30} class="ring-2 ring-white" />{/each}</div>
						</div>
					{/if}
					{#if t.labels.length}
						<div class="flex flex-col gap-1.5"><span class="text-xs text-neutral-500">Labels</span>
							<div class="flex flex-wrap gap-1.5">
								{#each t.labels as l (l)}
									<span class="inline-flex h-7 items-center gap-1 rounded-md bg-brand-50 px-2 text-xs text-brand-600">
										{l}
										{#if editable}<button type="button" aria-label="Remove label {l}" onclick={() => save(t, { labels: t.labels.filter((x) => x !== l) })}><Icon name="close" size={12} /></button>{/if}
									</span>
								{/each}
							</div>
						</div>
					{/if}
					{#if t.dueDate}
						<div class="flex flex-col gap-1.5"><span class="text-xs text-neutral-500">Due date</span>
							<span class="inline-flex h-7 items-center gap-1.5 text-sm text-neutral-800">
								{formatDate(t.dueDate)}
								{#if t.completed}<span class="rounded bg-green-50 px-1.5 text-xs text-green-600">Complete</span>{/if}
							</span>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Description -->
			<section class="flex flex-col gap-2">
				<h3 class="flex items-center gap-2 text-md text-neutral-800"><Icon name="text" size={20} />Description</h3>
				<textarea
					value={descDraft ?? t.description ?? ''}
					rows="4"
					placeholder="Add more detailed description"
					aria-label="Description"
					disabled={!editable}
					class="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-500 focus:border-brand-500 disabled:bg-neutral-50"
					oninput={(e) => (descDraft = e.currentTarget.value)}
				></textarea>
				{#if descDraft !== null && descDraft !== (t.description ?? '')}
					<div class="flex gap-2">
						<Button size="sm" loading={mutations.updateTask.isPending} onclick={() => save(t, { description: descDraft?.trim() || null }).then(() => (descDraft = null))}>Save</Button>
						<Button variant="outline" size="sm" onclick={() => (descDraft = null)}>Cancel</Button>
					</div>
				{/if}
			</section>

			<!-- Checklist -->
			{#if t.checklistTotal || panel === 'checklist'}
				<section class="flex flex-col gap-2">
					<h3 class="flex items-center gap-2 text-md text-neutral-800"><Icon name="checkSquare" size={20} />Checklist
						<span class="ml-auto text-xs text-neutral-500">{t.checklistDone}/{t.checklistTotal}</span>
					</h3>
					{#if t.checklistTotal}
						<div class="h-1.5 overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-label="Checklist progress" aria-valuenow={t.checklistDone} aria-valuemax={t.checklistTotal}>
							<div class="h-full bg-brand-600 transition-[width]" style:width="{(t.checklistDone / t.checklistTotal) * 100}%"></div>
						</div>
					{/if}
					<ul class="flex flex-col gap-1">
						{#each t.checklist as item (item.id)}
							<li class="group flex items-center gap-2 rounded px-1 py-1 hover:bg-neutral-50">
								<input type="checkbox" class="size-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={item.done} disabled={!editable} aria-label={item.text} onchange={(e) => mutations.toggleChecklistItem.mutate({ itemId: item.id, done: e.currentTarget.checked })} />
								<span class={cn('flex-1 text-sm', item.done ? 'text-neutral-400 line-through' : 'text-neutral-800')}>{item.text}</span>
								{#if editable}
									<button type="button" class="text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-brand-600 focus:opacity-100" aria-label="Delete {item.text}" onclick={() => mutations.deleteChecklistItem.mutate(item.id)}><Icon name="trash" size={16} /></button>
								{/if}
							</li>
						{/each}
					</ul>
					{#if editable}
						<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), checkDraft.trim() && mutations.addChecklistItem.mutate({ taskId: t.id, text: checkDraft.trim() }), (checkDraft = ''))}>
							<input bind:value={checkDraft} placeholder="Add an item" aria-label="New checklist item" class="h-[38px] flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500" />
							<Button type="submit" size="md" disabled={!checkDraft.trim()}>Add</Button>
						</form>
					{/if}
				</section>
			{/if}

			<!-- Comments -->
			{#if showComments}
				<section class="flex flex-col gap-3 border-t border-neutral-100 pt-4" aria-label="Comments">
					<form class="flex gap-2" onsubmit={(e) => (e.preventDefault(), commentDraft.trim() && mutations.addComment.mutate({ taskId: t.id, body: commentDraft.trim() }), (commentDraft = ''))}>
						<input bind:value={commentDraft} placeholder="Write a comment…" aria-label="Comment" class="h-[38px] flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-brand-500" />
						<Button type="submit" size="md" icon="send" disabled={!commentDraft.trim()}>Send</Button>
					</form>
					{#if comments.isPending}
						<Skeleton height="44px" rounded="lg" />
					{:else if !comments.data?.length}
						<p class="text-sm text-neutral-500">No comments yet.</p>
					{:else}
						<ul class="flex flex-col gap-3">
							{#each comments.data as c (c.id)}
								<li class="flex gap-2.5">
									<Avatar src={c.author?.avatar} name={c.author?.name ?? 'Someone'} size={30} />
									<div class="flex min-w-0 flex-col gap-1">
										<p class="text-sm text-neutral-800">{c.author?.name ?? 'Former user'} <span class="text-xs text-brand-600">{timeLabel(c.createdAt)}</span></p>
										<p class="rounded-lg bg-neutral-100 px-3 py-2 text-sm whitespace-pre-wrap text-neutral-700">{c.body}</p>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}
		</div>
	{/if}
</Modal>
