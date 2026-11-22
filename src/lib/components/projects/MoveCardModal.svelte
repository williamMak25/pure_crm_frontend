<script lang="ts">
	import { createBoardDetailQuery, createBoardsQuery } from '#lib/queries/projects.ts';
	import Button from '../ui/button/Button.svelte';
	import Modal from '../ui/modal/Modal.svelte';
	import Select from '../ui/select/Select.svelte';

	// Figma "Move Card" (326px): Board + List (+ position), Cancel / Move.
	interface Props {
		open: boolean;
		boardId: string;
		currentListId?: string;
		pending: boolean;
		onmove: (toListId: string, position: 'top' | 'bottom') => void;
		onclose: () => void;
	}
	let { open, boardId, currentListId, pending, onmove, onclose }: Props = $props();

	let pickedBoard = $state('');
	let pickedList = $state('');
	let position = $state<'top' | 'bottom'>('bottom');
	const targetBoard = $derived(pickedBoard || boardId);

	const boards = createBoardsQuery(() => ({ pageSize: 100 }));
	const target = createBoardDetailQuery(() => (open ? targetBoard : null));
	// Only boards (and lists) the user can edit can receive the card.
	const boardOptions = $derived((boards.data?.items ?? []).map((b) => ({ label: `${b.title} · ${b.business}`, value: b.id })));
	const listOptions = $derived(
		target.data?.canEdit
			? target.data.lists.filter((l) => l.id !== currentListId).map((l) => ({ label: l.title, value: l.id }))
			: []
	);

	function close() {
		pickedBoard = pickedList = '';
		position = 'bottom';
		onclose();
	}
</script>

<Modal {open} title="Move Card" width={326} onclose={close}>
	<div class="flex flex-col gap-4">
		<Select
			value={targetBoard}
			label="Board"
			required
			placeholder="Select Board"
			options={boardOptions}
			onchange={(e) => {
				pickedBoard = e.currentTarget.value;
				pickedList = '';
			}}
		/>
		<Select
			bind:value={pickedList}
			label="List"
			required
			placeholder={target.isPending ? 'Loading lists…' : target.data && !target.data.canEdit ? 'You can only view this board' : 'Select list'}
			options={listOptions}
		/>
		<Select bind:value={position} label="Position" options={[{ label: 'Bottom', value: 'bottom' }, { label: 'Top', value: 'top' }]} />
	</div>
	{#snippet footer()}
		<Button variant="outline-brand" size="lg" fullWidth onclick={close}>Cancel</Button>
		<Button
			size="lg"
			fullWidth
			disabled={!pickedList}
			loading={pending}
			onclick={() => {
				onmove(pickedList, position);
				close();
			}}>Move</Button
		>
	{/snippet}
</Modal>
