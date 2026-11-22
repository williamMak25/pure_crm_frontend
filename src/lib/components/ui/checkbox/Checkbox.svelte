<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		checked?: boolean;
		label?: string;
		disabled?: boolean;
		name?: string;
		class?: string;
		onchange?: (checked: boolean) => void;
		children?: Snippet;
	}

	let { checked = $bindable(false), label, disabled, name, class: className = '', onchange, children }: Props = $props();
</script>

<!-- Figma "Check List" / "Check Box": 16px box, Brand/600 when checked. -->
<label class="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-800 has-disabled:cursor-not-allowed has-disabled:opacity-60 {className}">
	<span class="relative inline-flex size-4 shrink-0">
		<input
			type="checkbox"
			class="peer size-4 cursor-pointer appearance-none rounded border border-neutral-300 bg-white checked:border-brand-600 checked:bg-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed"
			bind:checked
			{disabled}
			{name}
			onchange={() => onchange?.(checked)}
		/>
		<Icon name="check" size={12} class="pointer-events-none absolute inset-0 m-auto hidden text-white peer-checked:block" />
	</span>
	{#if children}{@render children()}{:else if label}<span>{label}</span>{/if}
</label>
