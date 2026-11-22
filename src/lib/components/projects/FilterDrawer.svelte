<script lang="ts">
	import Button from '../ui/button/Button.svelte';
	import Checkbox from '../ui/checkbox/Checkbox.svelte';
	import Input from '../ui/input/Input.svelte';
	import Modal from '../ui/modal/Modal.svelte';
	import { emptyFilters, type BoardFilters, type FilterKey, type FilterSection } from './board-filter';

	// Figma "Filter" (564px drawer): keyword search + checklist sections.
	interface Props {
		open: boolean;
		filters: BoardFilters;
		sections: FilterSection[];
		onclose: () => void;
	}
	let { open, filters = $bindable(), sections, onclose }: Props = $props();

	const toggle = (key: FilterKey, option: string, checked: boolean) => {
		filters[key] = checked ? [...filters[key], option] : filters[key].filter((o) => o !== option);
	};
</script>

<Modal {open} title="Filter" placement="drawer" width={564} {onclose}>
	<div class="flex flex-col gap-5">
		<Input bind:value={filters.keyword} icon="search" placeholder="Search keyword ..." aria-label="Search keyword" />
		{#each sections as section (section.key)}
			<fieldset class="flex flex-col gap-3">
				<legend class="mb-3 w-full border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-800">{section.label}</legend>
				{#each section.options as option (option.value)}
					<Checkbox
						label={option.label}
						checked={filters[section.key].includes(option.value)}
						onchange={(c) => toggle(section.key, option.value, c)}
					/>
				{/each}
			</fieldset>
		{/each}
	</div>
	{#snippet footer()}
		<Button variant="outline-brand" size="lg" fullWidth onclick={() => (filters = emptyFilters())}>Clear all</Button>
		<Button size="lg" fullWidth onclick={onclose}>Apply</Button>
	{/snippet}
</Modal>
