<script lang="ts" generics="TType extends 'line' | 'bar' | 'doughnut'">
	import type { ChartData, ChartOptions } from 'chart.js';
	import { untrack } from 'svelte';
	import { Chart } from './chart-config';

	interface Props {
		type: TType;
		data: ChartData<TType>;
		options: ChartOptions<TType>;
		height?: number;
		label: string;
	}

	let { type, data, options, height = 320, label }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart<TType> | undefined;

	// Chart.js is an imperative library: create once, then push data updates into it.
	$effect(() => {
		chart = untrack(
			() => new Chart(canvas, { type, data: $state.snapshot(data) as ChartData<TType>, options })
		);
		return () => chart?.destroy();
	});

	$effect(() => {
		const next = $state.snapshot(data) as ChartData<TType>;
		if (!chart) return;
		chart.data = next;
		chart.update();
	});
</script>

<!-- Container controls size; Chart.js resizes with it (responsive + maintainAspectRatio:false). -->
<div class="relative w-full" style:height="{height}px">
	<canvas bind:this={canvas} aria-label={label}>{label}</canvas>
</div>
