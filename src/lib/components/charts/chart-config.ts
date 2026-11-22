import {
	ArcElement,
	BarController,
	BarElement,
	CategoryScale,
	Chart,
	DoughnutController,
	Filler,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Tooltip,
	type ChartOptions,
	type TooltipItem
} from 'chart.js';
import { formatMoney, formatNumber } from '#lib/utils/format.ts';

// Register only what we use (tree-shakeable Chart.js).
Chart.register(
	LineController,
	LineElement,
	PointElement,
	BarController,
	BarElement,
	DoughnutController,
	ArcElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Filler
);

/** Figma colour tokens used by charts. */
export const CHART_COLORS = {
	brand: '#D51F2E',
	brandLight: '#F7A9AF',
	green: '#22C55E',
	blue: '#3B82F6',
	amber: '#F59E0B',
	neutral: '#A3A3A3',
	grid: '#E5E5E5',
	tick: '#525252'
} as const;

export const CATEGORY_PALETTE = [CHART_COLORS.brand, CHART_COLORS.brandLight, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.neutral];

Chart.defaults.font.family = "'Inter Variable', 'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = CHART_COLORS.tick;

const baseTooltip = {
	backgroundColor: '#262626',
	padding: 10,
	cornerRadius: 8,
	titleFont: { weight: 500 as const }
};

const moneyLabel = (ctx: TooltipItem<'line'> | TooltipItem<'bar'>) =>
	` ${ctx.dataset.label}: ${formatMoney(Number((ctx.parsed as { y: number }).y))}`;

const moneyTooltip = { ...baseTooltip, callbacks: { label: moneyLabel } };

/** Revenue & Expenses line chart: full grid, ticks outside axis, hollow points (Figma "Chart"). */
export const lineOptions: ChartOptions<'line'> = {
	responsive: true,
	maintainAspectRatio: false,
	interaction: { mode: 'index', intersect: false },
	layout: { padding: { top: 6, right: 6 } },
	plugins: { legend: { display: false }, tooltip: moneyTooltip },
	elements: {
		line: { borderWidth: 1, tension: 0 },
		point: { radius: 5, hoverRadius: 6, borderWidth: 1, backgroundColor: '#fff' }
	},
	scales: {
		x: {
			grid: { color: CHART_COLORS.grid, tickLength: 10 },
			border: { color: '#262626' },
			ticks: { padding: 6 }
		},
		y: {
			beginAtZero: true,
			grid: { color: CHART_COLORS.grid, tickLength: 10 },
			border: { color: '#262626' },
			ticks: { count: 5, padding: 6, callback: (v) => String(Math.round(Number(v))) }
		}
	}
};

export const barOptions: ChartOptions<'bar'> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: { legend: { display: false }, tooltip: moneyTooltip },
	datasets: { bar: { borderRadius: 6, maxBarThickness: 28, categoryPercentage: 0.6 } },
	scales: {
		x: { grid: { display: false }, border: { color: CHART_COLORS.grid } },
		y: {
			beginAtZero: true,
			grid: { color: CHART_COLORS.grid },
			border: { display: false },
			ticks: { maxTicksLimit: 5, callback: (v) => `${formatNumber(Number(v) / 1_000_000)}M` }
		}
	}
};

export const doughnutOptions: ChartOptions<'doughnut'> = {
	responsive: true,
	maintainAspectRatio: false,
	cutout: '68%',
	plugins: {
		legend: { display: false },
		tooltip: { ...baseTooltip, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
	}
};

export { Chart };
