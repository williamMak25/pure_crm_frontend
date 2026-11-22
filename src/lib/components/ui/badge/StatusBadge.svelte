<script lang="ts">
	import { STATUS_TONE, TONE_CLASSES, type Tone } from '#lib/constants/status.ts';
	import type { Status } from '#lib/types/index.ts';

	interface Props {
		status: Status | string;
		tone?: Tone;
		/** "dot" = the "• In Progress" inline style used in dashboard lists. */
		variant?: 'pill' | 'dot';
		class?: string;
	}

	let { status, tone, variant = 'pill', class: className = '' }: Props = $props();
	const t = $derived(tone ?? STATUS_TONE[status as Status] ?? 'neutral');
</script>

{#if variant === 'dot'}
	<span class="inline-flex items-center gap-[3px] text-sm whitespace-nowrap text-brand-600 {className}">
		<span class="size-1 rounded-full bg-brand-600"></span>{status}
	</span>
{:else}
	<span class="inline-flex h-6 items-center rounded-md px-2 text-sm whitespace-nowrap {TONE_CLASSES[t]} {className}">
		{status}
	</span>
{/if}
