<script lang="ts">
	import type { IconName } from '#lib/constants/icons.ts';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		group?: string;
		value: string;
		label: string;
		icon?: IconName;
		name: string;
	}

	let { group = $bindable(), value, label, icon, name }: Props = $props();
</script>

<!-- Figma "Visibility" option: bordered card with radio + icon + label. -->
<label
	class="flex h-[46px] flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm text-neutral-700 transition-colors has-checked:border-brand-500 has-checked:bg-brand-50/40 {group === value
		? ''
		: 'border-neutral-200 hover:border-neutral-300'}"
>
	<input
		type="radio"
		{name}
		{value}
		bind:group
		class="size-4 cursor-pointer appearance-none rounded-full border border-neutral-300 checked:border-[5px] checked:border-brand-600"
	/>
	{#if icon}<Icon name={icon} size={20} class="text-neutral-700" />{/if}
	<span>{label}</span>
</label>
