<script lang="ts">
	import ChartCanvas from './ChartCanvas.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import { CATEGORY_PALETTE, doughnutOptions } from './chart-config';

	let { items, height = 220, label }: { items: { label: string; value: number }[]; height?: number; label: string } = $props();

	const data = $derived({
		labels: items.map((i) => i.label),
		datasets: [{ data: items.map((i) => i.value), backgroundColor: CATEGORY_PALETTE, borderWidth: 0 }]
	});
</script>

<div class="flex flex-col items-center gap-4">
	<div class="w-full max-w-[240px]"><ChartCanvas type="doughnut" {data} options={doughnutOptions} {height} {label} /></div>
	<ChartLegend items={items.map((i, n) => ({ label: i.label, color: CATEGORY_PALETTE[n % CATEGORY_PALETTE.length], value: `${i.value}%` }))} />
</div>
