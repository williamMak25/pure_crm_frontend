<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Field from '../input/Field.svelte';
	import Icon from '../icon/Icon.svelte';
	import { cn } from '#lib/utils/cn.ts';

	export type Option = { label: string; value: string };

	interface Props extends Omit<HTMLSelectAttributes, 'size'> {
		value?: string;
		options: (Option | string)[];
		label?: string;
		placeholder?: string;
		error?: string;
		size?: 'sm' | 'md';
		class?: string;
	}

	let {
		value = $bindable(''),
		options,
		label,
		placeholder,
		error,
		required,
		disabled,
		size = 'md',
		id = `sel-${Math.random().toString(36).slice(2, 9)}`,
		class: className,
		...rest
	}: Props = $props();

	const opts = $derived(options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o)));
</script>

<Field id={id ?? ''} {label} {required} {error} class={className}>
	<div class="relative">
		<select
			bind:value
			{id}
			{required}
			{disabled}
			aria-invalid={error ? 'true' : undefined}
			class={cn(
				'w-full appearance-none rounded-lg border border-neutral-200 bg-white pr-9 pl-3 text-sm text-neutral-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50 disabled:bg-neutral-100',
				size === 'md' ? 'h-[42px]' : 'h-[34px]',
				!value && 'text-neutral-400',
				error && 'border-brand-500'
			)}
			{...rest}
		>
			{#if placeholder}<option value="" disabled={required}>{placeholder}</option>{/if}
			{#each opts as o (o.value)}
				<option value={o.value} class="text-neutral-800">{o.label}</option>
			{/each}
		</select>
		<Icon name="chevronDown" size={18} class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-neutral-600" />
	</div>
</Field>
