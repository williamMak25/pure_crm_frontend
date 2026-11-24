<script lang="ts">
	import ComparisonBarChart from '#lib/components/charts/ComparisonBarChart.svelte';
	import DoughnutChart from '#lib/components/charts/DoughnutChart.svelte';
	import { CHART_COLORS } from '#lib/components/charts/chart-config.ts';
	import StatCard from '#lib/components/dashboard/StatCard.svelte';
	import StatCardSkeleton from '#lib/components/dashboard/StatCardSkeleton.svelte';
	import ModuleLayout from '#lib/components/layout/ModuleLayout.svelte';
	import Panel from '#lib/components/ui/card/Panel.svelte';
	import ChartSkeleton from '#lib/components/ui/skeleton/ChartSkeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import SegmentTabs from '#lib/components/ui/tabs/SegmentTabs.svelte';
	import { MODULES } from '#lib/constants/modules.ts';
	import { createCashFlowQuery } from '#lib/queries/modules.ts';
	import type { TrendRange } from '#lib/types/index.ts';
	import { formatMoney } from '#lib/utils/format.ts';

	let range = $state<TrendRange>('monthly');
	const flow = createCashFlowQuery(() => range);
	const ranges = [
		{ label: 'Weekly', value: 'weekly' },
		{ label: 'Monthly', value: 'monthly' },
		{ label: 'Yearly', value: 'yearly' }
	];
</script>

<svelte:head><title>Cash Flow · PURE ERP</title></svelte:head>

<ModuleLayout {...MODULES.finance}>
	{#snippet action()}
		<SegmentTabs tabs={ranges} value={range} onchange={(v) => (range = v as TrendRange)} />
	{/snippet}

	{#if flow.isError}
		<div class="rounded-xl bg-white"><ErrorState error={flow.error} onretry={() => flow.refetch()} /></div>
	{:else}
		<section aria-label="Cash flow summary" class="grid grid-cols-1 gap-4 md:grid-cols-3">
			{#if flow.isPending}
				{#each Array(3) as _, i (i)}<StatCardSkeleton />{/each}
			{:else}
				<StatCard label="Total Income" value={formatMoney(flow.data.summary.income)} caption="Selected period" icon="trendingUp" />
				<StatCard label="Total Expense" value={formatMoney(flow.data.summary.expense)} caption="Selected period" icon="trendingDown" />
				<StatCard label="Net Cash Flow" value={formatMoney(flow.data.summary.net)} caption={flow.data.summary.net >= 0 ? 'Positive balance' : 'Negative balance'} icon="banknote" />
			{/if}
		</section>

		<div class="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
			<Panel title="Income vs Expense">
				{#if flow.isPending}
					<ChartSkeleton height={330} />
				{:else}
					<ComparisonBarChart
						label="Income versus expense by period"
						labels={flow.data.labels}
						series={[
							{ label: 'Income', data: flow.data.income, color: CHART_COLORS.brand },
							{ label: 'Expense', data: flow.data.expense, color: CHART_COLORS.brandLight }
						]}
					/>
				{/if}
			</Panel>
			<Panel title="Expense by Category">
				{#if flow.isPending}
					<ChartSkeleton height={300} />
				{:else}
					<DoughnutChart label="Expense share by category" items={flow.data.byCategory} />
				{/if}
			</Panel>
		</div>
	{/if}
</ModuleLayout>
