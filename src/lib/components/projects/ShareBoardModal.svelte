<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createBoardCandidatesQuery, type BoardMutations } from '#lib/queries/projects.ts';
	import type { BoardAccess, BoardMember } from '#lib/types/index.ts';
	import Avatar from '../ui/avatar/Avatar.svelte';
	import Button from '../ui/button/Button.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Input from '../ui/input/Input.svelte';
	import Modal from '../ui/modal/Modal.svelte';

	// Figma "Popup / Share Board" (480px).
	interface Props {
		open: boolean;
		boardId: string;
		members: BoardMember[];
		canManage: boolean;
		mutations: BoardMutations;
		onclose: () => void;
	}
	let { open, boardId, members, canManage, mutations, onclose }: Props = $props();

	let who = $state('');
	let error = $state('');
	const candidates = createBoardCandidatesQuery(() => boardId, () => open && canManage);
	const listId = `share-${Math.random().toString(36).slice(2, 8)}`;

	const ACCESS: BoardAccess[] = ['Admin', 'Member', 'Viewer'];
	const accessItems = [...ACCESS.map((v) => ({ value: v, label: v })), { value: 'remove', label: 'Remove from board', icon: 'trash' as const, danger: true }];

	async function share(e: SubmitEvent) {
		e.preventDefault();
		if (who.trim().length < 2) {
			error = 'Enter an email address or name';
			return;
		}
		try {
			await mutations.share.mutateAsync({ user: who.trim(), access: 'Member' });
			who = '';
		} catch {
			/* toast shown by the mutation */
		}
	}

	function onaccess(m: BoardMember, value: string) {
		if (value === 'remove') {
			if (confirm(`Remove ${m.name} from this board?`)) mutations.removeMember.mutate(m.memberId);
		} else if (value !== m.access) {
			mutations.updateMember.mutate({ memberId: m.memberId, access: value as BoardAccess });
		}
	}

	async function copyLink() {
		await navigator.clipboard?.writeText(`${window.location.origin}/projects/${boardId}`);
		toast.success('Board link copied');
	}
</script>

<Modal {open} title="Share Board" centerTitle width={480} {onclose}>
	<div class="flex flex-col gap-4">
		<form class="flex items-start gap-2" onsubmit={share} novalidate>
			<Input
				bind:value={who}
				placeholder="Email address or name"
				aria-label="Email address or name"
				class="flex-1"
				list={listId}
				disabled={!canManage}
				{error}
				oninput={() => (error = '')}
			/>
			<datalist id={listId}>
				{#each candidates.data ?? [] as c (c.id)}<option value={c.email ?? c.name}>{c.name}</option>{/each}
			</datalist>
			<button type="button" class="grid size-[42px] shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200" aria-label="Copy board link" onclick={copyLink}>
				<Icon name="link" />
			</button>
			<Button type="submit" size="lg" loading={mutations.share.isPending} disabled={!canManage}>Share</Button>
		</form>
		{#if !canManage}<p class="text-xs text-neutral-500">Only board admins can add people or change access.</p>{/if}

		<div class="rounded-lg border border-neutral-200 p-3">
			<h3 class="border-b border-neutral-200 pb-2 text-sm text-neutral-800">Board Members</h3>
			<ul class="mt-2 flex flex-col gap-2">
				{#each members as m (m.memberId)}
					<li class="flex items-center gap-3">
						<Avatar src={m.avatar} name={m.name} size={44} />
						<div class="flex min-w-0 flex-1 flex-col">
							<span class="truncate text-sm font-medium text-neutral-800">{m.name}</span>
							<span class="truncate text-xs text-neutral-500">{m.label}</span>
						</div>
						{#if canManage}
							<Dropdown
								items={accessItems}
								selected={m.access}
								onselect={(v) => onaccess(m, v)}
								triggerLabel="Change access for {m.name}"
								triggerClass="inline-flex h-[34px] items-center gap-1 rounded-md border border-neutral-300 px-2 text-sm text-neutral-700 hover:bg-neutral-50"
							>
								{#snippet trigger()}{m.access}<Icon name="chevronDown" size={18} />{/snippet}
							</Dropdown>
						{:else}
							<span class="text-sm text-neutral-600">{m.access}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</Modal>
