<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		checked: boolean;
		label: string;
		description?: string;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	}

	let { checked, label, description, disabled, onchange }: Props = $props();
</script>

<Switch {checked} {disabled} onCheckedChange={(d) => onchange(d.checked)} class="flex w-full items-center justify-between gap-4">
	<Switch.Label class="flex flex-col">
		<span class="text-sm font-medium text-neutral-800">{label}</span>
		{#if description}<span class="text-xs text-neutral-500">{description}</span>{/if}
	</Switch.Label>
	<Switch.Control
		class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-neutral-300 transition-colors data-[state=checked]:bg-brand-600 data-disabled:opacity-50"
	>
		<Switch.Thumb class="size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
	</Switch.Control>
	<Switch.HiddenInput />
</Switch>
