<script lang="ts" generics="T extends { id: string }">
	import type { Snippet } from 'svelte';
	import StatusBadge from '../ui/badge/StatusBadge.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import { formatDate, formatMoney, formatNumber } from '#lib/utils/format.ts';
	import type { Column } from './types';

	interface Props {
		columns: Column<T>[];
		rows: T[];
		/** Turns the "View" action into a link. */
		rowHref?: (row: T) => string;
		onview?: (row: T) => void;
		/** Override rendering of any cell. Return nothing to fall back to default. */
		cell?: Snippet<[T, Column<T>]>;
		caption?: string;
		dimmed?: boolean;
	}

	let { columns, rows, rowHref, onview, cell, caption, dimmed = false }: Props = $props();
</script>

<!-- Figma "Table lists": 52px header/rows, zebra Neutral/50, centred cells, 8px radius frame. -->
<div class="scrollbar-thin overflow-x-auto rounded-lg border border-neutral-200 transition-opacity {dimmed ? 'opacity-60' : ''}">
	<table class="w-full min-w-max border-collapse text-sm">
		{#if caption}<caption class="sr-only">{caption}</caption>{/if}
		<thead>
			<tr class="h-[52px] bg-white">
				{#each columns as col (col.key)}
					<th
						scope="col"
						class="border-r border-b border-neutral-200 px-3 font-medium whitespace-nowrap text-neutral-800 last:border-r-0"
						style:min-width={col.minWidth ? `${col.minWidth}px` : '120px'}
					>
						{col.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (row.id)}
				<tr class="h-[52px] {i % 2 ? 'bg-neutral-50' : 'bg-white'} hover:bg-brand-50/30">
					{#each columns as col (col.key)}
						<td class="px-3 text-center whitespace-nowrap text-neutral-700 {col.align === 'left' ? 'text-left' : ''}">
							{#if cell}
								{@render cell(row, col)}
							{:else if col.format === 'status'}
								<StatusBadge status={String(row[col.key])} />
							{:else if col.format === 'money'}
								{formatMoney(Number(row[col.key]))}
							{:else if col.format === 'number'}
								{formatNumber(Number(row[col.key]))}
							{:else if col.format === 'date'}
								{formatDate(row[col.key] as string | null)}
							{:else if col.format === 'view'}
								{#if rowHref}
									<a href={rowHref(row)} class="inline-flex items-center gap-1.5 rounded px-1 text-neutral-700 hover:text-brand-600">
										<Icon name="eye" size={20} /> View
									</a>
								{:else}
									<button type="button" class="inline-flex items-center gap-1.5 rounded px-1 text-neutral-700 hover:text-brand-600" onclick={() => onview?.(row)}>
										<Icon name="eye" size={20} /> View
									</button>
								{/if}
							{:else}
								{row[col.key]}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
