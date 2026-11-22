<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { IconName } from '#lib/constants/icons.ts';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import {
		createAddActivityMutation,
		createCrmPeopleQuery,
		createDealActivitiesQuery,
		createDealMessagesQuery,
		createDeleteActivityMutation,
		createSendMessageMutation,
		createToggleActivityMutation
	} from '#lib/queries/modules.ts';
	import type { ActivityKind, DealDetail, DealMessage } from '#lib/types/index.ts';
	import { debounced } from '#lib/utils/debounce.svelte.ts';
	import { formatDate } from '#lib/utils/format.ts';
	import { cn } from '#lib/utils/cn.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Button from '../ui/button/Button.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Input from '../ui/input/Input.svelte';
	import Select from '../ui/select/Select.svelte';
	import Skeleton from '../ui/skeleton/Skeleton.svelte';
	import EmptyState from '../ui/state/EmptyState.svelte';

	// Figma "Edit Pipeline" right card: search, link / lock, then Send Message · Long Note · Activity.
	let { deal, locked = $bindable(false) }: { deal: DealDetail; locked?: boolean } = $props();

	type Tab = 'message' | 'note' | 'activity';
	let tab = $state<Tab>('message');
	let search = $state('');
	const term = debounced(() => search);

	const me = createMeQuery();
	const people = createCrmPeopleQuery(() => deal.business);
	// "Send Message" shows the whole timeline; "Long Note" only the notes.
	const messages = createDealMessagesQuery(
		() => deal.id,
		() => (tab === 'note' ? 'note' : undefined),
		() => term.current
	);
	const activities = createDealActivitiesQuery(() => deal.id);

	/* ---------- composers ---------- */
	let draft = $state({ body: '', to: '', subject: '' });
	let noteDraft = $state('');
	const send = createSendMessageMutation(() => deal.id, () => (draft = { body: '', to: '', subject: '' }));
	const logNote = createSendMessageMutation(() => deal.id, () => (noteDraft = ''));

	const ACTIVITY_KINDS: { kind: ActivityKind; icon: IconName }[] = [
		{ kind: 'To Do', icon: 'check' },
		{ kind: 'Email', icon: 'mail' },
		{ kind: 'Call', icon: 'phone' },
		{ kind: 'Meeting', icon: 'video' },
		{ kind: 'Document', icon: 'invoices' },
		{ kind: 'Signature', icon: 'signature' }
	];
	const blankActivity = () => ({ kind: 'To Do' as ActivityKind, summary: '', dueDate: '', assignedTo: '' });
	let activity = $state(blankActivity());
	const addActivity = createAddActivityMutation(() => deal.id, () => (activity = blankActivity()));
	const toggleActivity = createToggleActivityMutation();
	const deleteActivity = createDeleteActivityMutation();

	/* ---------- formatting ---------- */
	const dayLabel = (iso: string) =>
		new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
	const timeLabel = (iso: string) =>
		new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

	// Group by calendar day for the "── Sep 12 2026 ──" separators.
	const grouped = $derived.by(() => {
		const out: { day: string; items: DealMessage[] }[] = [];
		for (const msg of messages.data ?? []) {
			const day = dayLabel(msg.createdAt);
			if (out.at(-1)?.day !== day) out.push({ day, items: [] });
			out.at(-1)!.items.push(msg);
		}
		return out;
	});

	async function copyLink() {
		const url = `${window.location.origin}/crm/pipeline?deal=${deal.id}`;
		try {
			await navigator.clipboard.writeText(url);
			toast.success('Link to this deal copied');
		} catch {
			toast.error('Could not copy the link');
		}
	}
</script>

{#snippet separator(label: string)}
	<div class="flex items-center gap-3 text-sm text-neutral-400" role="separator">
		<span class="h-px flex-1 bg-neutral-200"></span>{label}<span class="h-px flex-1 bg-neutral-200"></span>
	</div>
{/snippet}

{#snippet entry(msg: DealMessage)}
	<article class="flex gap-2.5">
		<Avatar src={msg.author?.avatar} name={msg.author?.name ?? 'Someone'} size={32} />
		<div class="flex min-w-0 flex-col gap-2">
			<p class="flex flex-wrap items-baseline gap-2 text-sm text-neutral-800">
				{msg.author?.name ?? 'Former user'}
				<time datetime={msg.createdAt} class="text-xs text-brand-600">{timeLabel(msg.createdAt)}</time>
			</p>
			{#if msg.kind === 'message'}
				<div class="flex flex-col gap-1 self-start rounded-lg bg-brand-50 px-2.5 py-2 text-sm text-neutral-700">
					{#if msg.recipient}<span class="text-xs text-neutral-500">To: {msg.recipient}</span>{/if}
					{#if msg.subject}<span>Subject: {msg.subject}</span>{/if}
					<span class="whitespace-pre-wrap">{msg.body}</span>
				</div>
			{:else}
				<div class="flex flex-col gap-1 text-sm text-neutral-700">
					{#if msg.subject}<span>Subject: {msg.subject}</span>{/if}
					<span class="flex flex-wrap items-center gap-1.5">
						<span class="whitespace-pre-wrap">{msg.body}</span>
						{#if msg.stageName}<Icon name="chevronRight" size={16} class="text-neutral-500" />{msg.stageName} (Stage){/if}
					</span>
				</div>
			{/if}
		</div>
	</article>
{/snippet}

<section class="flex min-h-[520px] flex-col gap-4 rounded-xl bg-white p-4" aria-label="Deal timeline">
	<div class="flex items-center gap-3">
		<Input bind:value={search} type="search" size="sm" appearance="subtle" icon="search" placeholder="Search" class="flex-1" aria-label="Search messages and notes" />
		<button type="button" class="grid size-9 place-items-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50" aria-label="Copy link to this deal" title="Copy link to this deal" onclick={copyLink}>
			<Icon name="link" size={18} />
		</button>
		<button
			type="button"
			class={cn('grid size-9 place-items-center rounded-lg border', locked ? 'border-brand-500 text-brand-600' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50')}
			aria-pressed={locked}
			aria-label={locked ? 'Unlock editing' : 'Lock editing'}
			title={locked ? 'Unlock editing' : 'Lock editing'}
			onclick={() => (locked = !locked)}
		>
			<Icon name="lock" size={18} />
		</button>
	</div>

	<div role="tablist" class="grid grid-cols-3 gap-3">
		{#each [{ v: 'message', l: 'Send Message' }, { v: 'note', l: 'Long Note' }, { v: 'activity', l: 'Activity' }] as t (t.v)}
			<Button role="tab" aria-selected={tab === t.v} size="md" variant={tab === t.v ? 'tab-active' : 'tab'} onclick={() => (tab = t.v as Tab)}>{t.l}</Button>
		{/each}
	</div>

	{#if tab === 'activity'}
		<form
			class="flex flex-1 flex-col gap-4"
			onsubmit={(e) => {
				e.preventDefault();
				addActivity.mutate({
					kind: activity.kind,
					summary: activity.summary.trim() || undefined,
					dueDate: activity.dueDate || undefined,
					assignedTo: activity.assignedTo || undefined
				});
			}}
		>
			<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Activity type">
				{#each ACTIVITY_KINDS as k (k.kind)}
					<button
						type="button"
						role="radio"
						aria-checked={activity.kind === k.kind}
						class={cn(
							'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm',
							activity.kind === k.kind ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
						)}
						onclick={() => (activity.kind = k.kind)}
					>
						<Icon name={k.icon} size={16} />{k.kind}
					</button>
				{/each}
			</div>
			<Input bind:value={activity.summary} label="Summary" placeholder={activity.kind} />
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Input bind:value={activity.dueDate} label="Due Date" type="date" />
				<Select
					bind:value={activity.assignedTo}
					label="Assigned to"
					placeholder={me.data?.name ?? 'You'}
					options={(people.data ?? []).map((p) => ({ label: p.name, value: p.id }))}
				/>
			</div>

			<div class="flex flex-1 flex-col gap-2">
				<h3 class="text-sm font-medium text-neutral-800">Planned activities</h3>
				{#if activities.isPending}
					<Skeleton height="40px" rounded="lg" />
				{:else if !activities.data?.length}
					<p class="text-sm text-neutral-500">Nothing planned yet.</p>
				{:else}
					<ul class="flex flex-col gap-2">
						{#each activities.data as a (a.id)}
							<li class="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-2 text-sm">
								<input
									type="checkbox"
									class="size-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
									checked={a.done}
									aria-label="Mark {a.summary} done"
									onchange={(e) => toggleActivity.mutate({ id: a.id, done: e.currentTarget.checked })}
								/>
								<div class="flex min-w-0 flex-1 flex-col">
									<span class={cn('text-neutral-800', a.done && 'text-neutral-400 line-through')}>{a.kind}: {a.summary}</span>
									<span class="text-xs text-neutral-500">
										{a.dueDate ? `Due ${formatDate(a.dueDate)}` : 'No due date'}{a.assignedTo ? ` · ${a.assignedTo.name}` : ''}
									</span>
								</div>
								<button type="button" class="text-neutral-500 hover:text-brand-600" aria-label="Remove {a.summary}" onclick={() => deleteActivity.mutate(a.id)}>
									<Icon name="trash" size={16} />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Button variant="outline-brand" size="lg" onclick={() => (activity = blankActivity())}>Cancel</Button>
				<Button type="submit" size="lg" loading={addActivity.isPending}>Save</Button>
			</div>
		</form>
	{:else}
		{#if tab === 'message'}
			<form
				class="flex gap-2.5"
				onsubmit={(e) => {
					e.preventDefault();
					if (!draft.body.trim()) return;
					send.mutate({ kind: 'message', body: draft.body.trim(), to: draft.to.trim() || undefined, subject: draft.subject.trim() || undefined });
				}}
			>
				<Avatar src={me.data?.avatar} name={me.data?.name ?? 'You'} size={32} />
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<div class="flex h-[42px] items-center gap-2 rounded-lg border border-neutral-200 px-3 focus-within:border-brand-500">
						<input bind:value={draft.body} placeholder="Where are you going to?" aria-label="Message" class="h-full w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-neutral-400 focus:ring-0" />
						<button type="button" class="text-neutral-600 hover:text-brand-600" aria-label="Insert the contact's social media link" disabled={!deal.socialMediaLink} onclick={() => (draft.body = `${draft.body} ${deal.socialMediaLink}`.trim())}>
							<Icon name="link" size={18} />
						</button>
						<button type="button" class="text-neutral-600 hover:text-brand-600" aria-label="Insert smiley" onclick={() => (draft.body += ' 🙂')}>
							<Icon name="smile" size={18} />
						</button>
					</div>
					<div class="flex items-end gap-3">
						<div class="flex flex-1 flex-col text-xs text-neutral-400">
							<label class="flex items-center gap-1">To:
								<input bind:value={draft.to} placeholder={deal.email ?? ''} class="w-48 border-0 border-b border-neutral-300 bg-transparent p-0 text-xs text-neutral-700 focus:border-brand-500 focus:ring-0" />
							</label>
							<label class="flex items-center gap-1">Subject:
								<input bind:value={draft.subject} class="w-48 border-0 border-b border-neutral-300 bg-transparent p-0 text-xs text-neutral-700 focus:border-brand-500 focus:ring-0" />
							</label>
						</div>
						<Button type="submit" size="sm" loading={send.isPending} disabled={!draft.body.trim()}>Send</Button>
					</div>
				</div>
			</form>
		{:else}
			<form
				class="flex gap-2.5"
				onsubmit={(e) => {
					e.preventDefault();
					if (noteDraft.trim()) logNote.mutate({ kind: 'note', body: noteDraft.trim() });
				}}
			>
				<Avatar src={me.data?.avatar} name={me.data?.name ?? 'You'} size={32} />
				<div class="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-neutral-200 px-3 focus-within:border-brand-500">
					<input bind:value={noteDraft} placeholder="Log an internal note" aria-label="Note" class="h-[42px] w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-neutral-400 focus:ring-0" />
				</div>
				<Button type="submit" size="md" loading={logNote.isPending} disabled={!noteDraft.trim()}>Log</Button>
			</form>
		{/if}

		<div class="flex flex-col gap-4">
			{#if messages.isPending}
				{#each Array(3) as _, i (i)}<Skeleton height="56px" rounded="lg" />{/each}
			{:else if !grouped.length}
				<EmptyState title={term.current ? 'Nothing matches your search' : tab === 'note' ? 'No notes yet' : 'No messages yet'} description="New entries will appear here." />
			{:else}
				{#each grouped as g (g.day)}
					{@render separator(g.day)}
					{#each g.items as msg (msg.id)}{@render entry(msg)}{/each}
				{/each}
			{/if}
		</div>
	{/if}
</section>
