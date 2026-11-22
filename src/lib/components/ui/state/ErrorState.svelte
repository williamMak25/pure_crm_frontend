<script lang="ts">
	import Button from '../button/Button.svelte';
	import Icon from '../icon/Icon.svelte';

	interface Props {
		error?: Error | null;
		onretry?: () => void;
		compact?: boolean;
	}
	let { error, onretry, compact = false }: Props = $props();
</script>

<div role="alert" class="flex flex-col items-center justify-center gap-2 text-center {compact ? 'py-6' : 'py-14'}">
	<span class="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600"><Icon name="alert" size={24} /></span>
	<p class="text-md font-medium text-neutral-800">Couldn't load this data</p>
	<p class="max-w-sm text-sm text-neutral-500">{error?.message ?? 'Please check your connection and try again.'}</p>
	{#if onretry}
		<Button variant="outline" size="sm" icon="refresh" class="mt-2" onclick={onretry}>Try again</Button>
	{/if}
</div>
