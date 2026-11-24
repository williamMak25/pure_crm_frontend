<script lang="ts">
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import ListBox from '#lib/components/dashboard/ListBox.svelte';
	import QueryList from '#lib/components/dashboard/QueryList.svelte';
	import RecentSalesTable from '#lib/components/dashboard/RecentSalesTable.svelte';
	import RevenueChartPanel from '#lib/components/dashboard/RevenueChartPanel.svelte';
	import StatCard from '#lib/components/dashboard/StatCard.svelte';
	import StatCardSkeleton from '#lib/components/dashboard/StatCardSkeleton.svelte';
	import StatusBadge from '#lib/components/ui/badge/StatusBadge.svelte';
	import Panel from '#lib/components/ui/card/Panel.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import {
		createActivitiesQuery,
		createAttentionQuery,
		createOutstandingQuery,
		createSummaryQuery,
		createUpcomingQuery
	} from '#lib/queries/dashboard.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import { formatMoney, formatNumber } from '#lib/utils/format.ts';

	const summary = createSummaryQuery(() => ui.business);
	const activities = createActivitiesQuery();
	const outstanding = createOutstandingQuery();
	const upcoming = createUpcomingQuery();
	const attention = createAttentionQuery();
</script>

<svelte:head><title>Overview · PURE ERP</title></svelte:head>

<div class="flex flex-col gap-4">
	<PageHeader title="Overview" description="Monitor your business performance and daily operations." />

	<section aria-label="Key figures" class="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 xl:grid-cols-4">
		{#if summary.isPending}
			{#each Array(4) as _, i (i)}<StatCardSkeleton />{/each}
		{:else if summary.isError}
			<div class="col-span-full rounded-xl bg-white"><ErrorState compact error={summary.error} onretry={() => summary.refetch()} /></div>
		{:else}
			{#each summary.data as s (s.key)}
				<StatCard
					label={s.label}
					value={s.unit ? formatMoney(s.value, s.unit) : formatNumber(s.value)}
					caption={s.caption}
				/>
			{/each}
		{/if}
	</section>

	<RevenueChartPanel />

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<Panel title="Recent Activities" viewAllHref="/crm/contacts">
			<QueryList query={activities}>
				{#snippet item(a)}
					<ListBox title={a.title} subtitle={a.actor} icon="check">
						{#snippet meta()}<StatusBadge variant="dot" status={a.timeAgo} />{/snippet}
					</ListBox>
				{/snippet}
			</QueryList>
		</Panel>

		<Panel title="Outstanding Payments" viewAllHref="/invoices/customer-invoices">
			<QueryList query={outstanding} skeletonCount={4} skeletonHeight={102}>
				{#snippet item(p)}
					<ListBox title={p.invoiceNo}>
						<p class="text-sm text-neutral-500">{p.customer}</p>
						<div class="flex flex-wrap items-center justify-between gap-x-3">
							<p class="text-sm text-neutral-600">Due Date - {p.dueDate}</p>
							<span class="inline-flex items-center gap-[3px] text-md text-brand-600">
								<span class="size-1 rounded-full bg-brand-600"></span>{formatMoney(p.amount)}
							</span>
						</div>
					</ListBox>
				{/snippet}
			</QueryList>
		</Panel>

		<Panel title="Upcoming Work" viewAllHref="/projects">
			<QueryList query={upcoming} skeletonHeight={76}>
				{#snippet item(w)}
					<ListBox title={w.title} subtitle={w.date} icon="user">
						{#snippet meta()}<StatusBadge variant="dot" status={w.status} />{/snippet}
					</ListBox>
				{/snippet}
			</QueryList>
		</Panel>

		<Panel title="Need your attention">
			<QueryList query={attention} skeletonHeight={76}>
				{#snippet item(a)}
					<ListBox title={a.title} subtitle={a.description} icon="checkCircle" iconStyle="ring">
						{#snippet meta()}<StatusBadge variant="dot" status={a.timeAgo} />{/snippet}
					</ListBox>
				{/snippet}
			</QueryList>
		</Panel>
	</div>

	<RecentSalesTable />
</div>
