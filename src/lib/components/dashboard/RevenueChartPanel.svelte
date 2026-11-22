<script lang="ts">
	import { createTrendQuery } from '#lib/queries/dashboard.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { TrendRange } from '#lib/types/index.ts';
	import TrendLineChart from '../charts/TrendLineChart.svelte';
	import { CHART_COLORS } from '../charts/chart-config';
	import Panel from '../ui/card/Panel.svelte';
	import Dropdown from '../ui/dropdown/Dropdown.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import ChartSkeleton from '../ui/skeleton/ChartSkeleton.svelte';
	import EmptyState from '../ui/state/EmptyState.svelte';
	import ErrorState from '../ui/state/ErrorState.svelte';

	const ranges: { value: TrendRange; label: string }[] = [
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' }
	];
	let range = $state<TrendRange>('weekly');
	const trend = createTrendQuery(() => range, () => ui.business);
	const rangeLabel = $derived(ranges.find((r) => r.value === range)?.label);
</script>

<Panel title="Revenue and Expenses">
	{#snippet actions()}
		<Dropdown
			items={ranges}
			selected={range}
			onselect={(v) => (range = v as TrendRange)}
			triggerLabel="Change range"
			triggerClass="inline-flex h-[34px] items-center gap-1 rounded-md border border-neutral-300 px-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
		>
			{#snippet trigger()}{rangeLabel}<Icon name="chevronDown" size={18} />{/snippet}
		</Dropdown>
	{/snippet}

	{#if trend.isPending}
		<ChartSkeleton height={364} />
	{:else if trend.isError}
		<ErrorState error={trend.error} onretry={() => trend.refetch()} />
	{:else if !trend.data.labels.length}
		<EmptyState title="No revenue data for this period" />
	{:else}
		<TrendLineChart
			label="Revenue and expenses, {rangeLabel?.toLowerCase()}"
			labels={trend.data.labels}
			series={[
				{ label: 'Revenue', data: trend.data.revenue, color: CHART_COLORS.brand },
				{ label: 'Expenses', data: trend.data.expenses, color: CHART_COLORS.brandLight }
			]}
		/>
	{/if}
</Panel>
