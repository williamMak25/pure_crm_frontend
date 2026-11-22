<script lang="ts" generics="T extends { id: string }">
	import Modal from '../ui/modal/Modal.svelte';
	import StatusBadge from '../ui/badge/StatusBadge.svelte';
	import { formatDate, formatMoney, formatNumber } from '#lib/utils/format.ts';
	import type { Column } from './types';

	// Read-only "View" dialog for list rows that have no dedicated detail page.
	interface Props {
		row: T | null;
		columns: Column<T>[];
		title: string;
		onclose: () => void;
	}
	let { row, columns, title, onclose }: Props = $props();
	const fields = $derived(columns.filter((c) => c.format !== 'view'));
</script>

<Modal open={!!row} {title} width={520} onclose={onclose}>
	{#if row}
		<dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
			{#each fields as c (c.key)}
				<div class="flex flex-col gap-1">
					<dt class="text-sm text-neutral-500">{c.label}</dt>
					<dd class="text-sm text-neutral-800">
						{#if c.format === 'status'}<StatusBadge status={String(row[c.key])} />
						{:else if c.format === 'money'}{formatMoney(Number(row[c.key]))}
						{:else if c.format === 'number'}{formatNumber(Number(row[c.key]))}
						{:else if c.format === 'date'}{formatDate(row[c.key] as string | null) || '—'}
						{:else}{row[c.key] ?? '—'}{/if}
					</dd>
				</div>
			{/each}
		</dl>
	{/if}
</Modal>
