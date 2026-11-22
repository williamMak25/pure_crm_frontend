<script lang="ts">
	import ChartCanvas from './ChartCanvas.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import { barOptions } from './chart-config';
	import type { Series } from './TrendLineChart.svelte';

	let { labels, series, height = 300, label }: { labels: string[]; series: Series[]; height?: number; label: string } = $props();

	const data = $derived({
		labels,
		datasets: series.map((s) => ({ label: s.label, data: s.data, backgroundColor: s.color }))
	});
</script>

<div class="flex flex-col gap-4">
	<ChartCanvas type="bar" {data} options={barOptions} {height} {label} />
	<ChartLegend items={series.map((s) => ({ label: s.label, color: s.color }))} />
</div>
