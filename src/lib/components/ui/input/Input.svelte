<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { IconName } from '#lib/constants/icons.ts';
	import Icon from '../icon/Icon.svelte';
	import Spinner from '../spinner/Spinner.svelte';
	import Field from './Field.svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: string | number | null;
		label?: string;
		error?: string;
		hint?: string;
		icon?: IconName;
		loading?: boolean;
		/** "md" = 42px form field, "sm" = 32px toolbar search. */
		size?: 'sm' | 'md';
		/** "subtle" = filled Neutral/50 search used above tables. */
		appearance?: 'default' | 'subtle';
		class?: string;
		inputClass?: string;
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable(),
		label,
		error,
		hint,
		icon,
		loading = false,
		size = 'md',
		appearance = 'default',
		required,
		disabled,
		id = `in-${Math.random().toString(36).slice(2, 9)}`,
		class: className,
		inputClass,
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<Field id={id ?? ''} {label} {required} {error} {hint} class={className}>
	<div
		class={cn(
			'flex items-center gap-2 rounded-lg border px-3 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-50',
			size === 'md' ? 'h-[42px]' : 'h-8 px-1.5',
			appearance === 'subtle' ? 'border-transparent bg-neutral-50' : 'border-neutral-200 bg-white',
			error && 'border-brand-500!',
			disabled && 'cursor-not-allowed bg-neutral-100',
			inputClass
		)}
	>
		{#if icon}<Icon name={icon} size={size === 'md' ? 20 : 16} class="text-neutral-400" />{/if}
		<input
			bind:this={ref}
			bind:value
			{id}
			{required}
			{disabled}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
			class="h-full w-full min-w-0 border-0 bg-transparent p-0 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0 disabled:cursor-not-allowed"
			{...rest}
		/>
		{#if loading}<Spinner size={16} class="text-neutral-400" />{/if}
	</div>
</Field>
