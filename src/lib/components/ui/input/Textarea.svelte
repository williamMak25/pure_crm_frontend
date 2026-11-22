<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import Field from './Field.svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props extends HTMLTextareaAttributes {
		value?: string;
		label?: string;
		error?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		label,
		error,
		required,
		rows = 4,
		id = `ta-${Math.random().toString(36).slice(2, 9)}`,
		class: className,
		...rest
	}: Props = $props();
</script>

<Field id={id ?? ''} {label} {required} {error} class={className}>
	<textarea
		bind:value
		{id}
		{rows}
		{required}
		aria-invalid={error ? 'true' : undefined}
		class={cn(
			'w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-50',
			error && 'border-brand-500'
		)}
		{...rest}
	></textarea>
</Field>
