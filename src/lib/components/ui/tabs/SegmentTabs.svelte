<script lang="ts">
	import Button from '../button/Button.svelte';

	// In-page tabs (state, not routes) sharing the pill look of LinkTabs.
	interface Props {
		tabs: { label: string; value: string }[];
		value: string;
		onchange: (v: string) => void;
	}
	let { tabs, value, onchange }: Props = $props();
</script>

<div role="tablist" class="scrollbar-thin flex gap-3 overflow-x-auto">
	{#each tabs as t (t.value)}
		<Button
			role="tab"
			aria-selected={value === t.value}
			size="md"
			variant={value === t.value ? 'tab-active' : 'tab'}
			onclick={() => onchange(t.value)}
		>
			{t.label}
		</Button>
	{/each}
</div>
