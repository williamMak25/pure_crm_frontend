<script lang="ts" module>
	import { addCollection } from '@iconify/svelte/dist/functions';
	import iconSet from '#lib/constants/icon-set.json';

	// Register the bundled subset once so icons render offline with no API round-trip.
	addCollection(iconSet as Parameters<typeof addCollection>[0]);
</script>

<script lang="ts">
	import IconifyIcon from '@iconify/svelte';
	import { ICONS, type IconName } from '#lib/constants/icons.ts';

	interface Props {
		/** Semantic name from constants/icons.ts, or any raw "lucide:*" id. */
		name: IconName | `lucide:${string}`;
		size?: number;
		class?: string;
		label?: string;
	}

	let { name, size = 20, class: className = '', label }: Props = $props();

	const icon = $derived(name in ICONS ? ICONS[name as IconName] : name);
</script>

<IconifyIcon
	{icon}
	width={size}
	height={size}
	class="shrink-0 {className}"
	aria-hidden={label ? undefined : 'true'}
	aria-label={label}
	role={label ? 'img' : undefined}
/>
