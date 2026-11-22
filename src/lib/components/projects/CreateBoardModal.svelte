<script lang="ts">
	import { createCreateBoardMutation } from '#lib/queries/projects.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { Visibility } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Input from '../ui/input/Input.svelte';
	import Modal from '../ui/modal/Modal.svelte';
	import RadioCard from '../ui/radio/RadioCard.svelte';
	import { VISIBILITY_OPTIONS } from './visibility';

	// Figma "Popup / Create Board" (426px).
	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	let title = $state('');
	let visibility = $state<Visibility>('workspace');
	let error = $state('');

	function reset() {
		title = '';
		visibility = 'workspace';
		error = '';
		onclose();
	}

	const create = createCreateBoardMutation(reset);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!title.trim()) {
			error = 'Board title is required';
			return;
		}
		create.mutate({ title: title.trim(), visibility, business: ui.business });
	}
</script>

<Modal {open} title="Create Board" centerTitle width={426} onclose={reset}>
	<form class="flex flex-col gap-6" onsubmit={submit} novalidate>
		<Input bind:value={title} label="Board Title" required placeholder="Enter Board Title" {error} oninput={() => (error = '')} />
		<fieldset class="flex flex-col gap-2">
			<legend class="mb-2 text-sm text-neutral-800">Visibility</legend>
			<div class="flex flex-col gap-3 sm:flex-row">
				{#each VISIBILITY_OPTIONS as o (o.value)}
					<RadioCard name="visibility" bind:group={visibility} value={o.value} label={o.label} icon={o.icon} />
				{/each}
			</div>
		</fieldset>
		<Button type="submit" size="lg" fullWidth loading={create.isPending}>Create Board</Button>
	</form>
</Modal>
