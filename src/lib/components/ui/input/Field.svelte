<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label?: string;
		required?: boolean | null;
		error?: string;
		hint?: string;
		class?: string;
		children: Snippet;
	}

	let { id, label, required, error, hint, class: className = '', children }: Props = $props();
</script>

<!-- Shared label / error wrapper for Input, Select, Textarea (Figma "Input box"). -->
<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={id} class="text-sm text-neutral-800">
			{label}{#if required}<span class="text-brand-500" aria-hidden="true">*</span>{/if}
		</label>
	{/if}
	{@render children()}
	{#if error}
		<p id="{id}-error" class="text-xs text-brand-600">{error}</p>
	{:else if hint}
		<p id="{id}-hint" class="text-xs text-neutral-500">{hint}</p>
	{/if}
</div>
