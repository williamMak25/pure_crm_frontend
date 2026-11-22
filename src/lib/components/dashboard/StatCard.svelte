<script lang="ts">
	import Icon from '../ui/icon/Icon.svelte';
	import type { IconName } from '#lib/constants/icons.ts';

	// Figma "Card": 12px radius, 20px padding, drop shadow, round Brand/50 icon chip.
	interface Props {
		label: string;
		value: string;
		caption: string;
		icon?: IconName;
	}
	let { label, value, caption, icon = 'contacts' }: Props = $props();
</script>

<article class="flex min-w-0 items-center gap-3 rounded-xl bg-white p-5 shadow-card">
	<span class="grid size-[50px] shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
		<Icon name={icon} size={30} />
	</span>
	<div class="flex min-w-0 flex-col gap-1">
		<p class="truncate text-sm font-medium text-neutral-800">{label}</p>
		<p class="truncate text-xl font-medium text-brand-600">{value}</p>
		<p class="truncate text-sm text-neutral-500">{caption}</p>
	</div>
</article>
