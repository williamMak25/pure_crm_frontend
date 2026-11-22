<script lang="ts">
	import ChartCanvas from './ChartCanvas.svelte';
	import ChartLegend from './ChartLegend.svelte';
	import { lineOptions } from './chart-config';

	export interface Series {
		label: string;
		data: number[];
		color: string;
	}

	interface Props {
		labels: string[];
		series: Series[];
		height?: number;
		label: string;
	}
	let { labels, series, height = 328, label }: Props = $props();

	const data = $derived({
		labels,
		datasets: series.map((s) => ({
			label: s.label,
			data: s.data,
			borderColor: s.color,
			pointBorderColor: s.color,
			pointBackgroundColor: '#fff'
		}))
	});
</script>

<div class="flex flex-col gap-4">
	<ChartCanvas type="line" {data} options={lineOptions} {height} {label} />
	<ChartLegend items={series.map((s) => ({ label: s.label, color: s.color }))} />
</div>
