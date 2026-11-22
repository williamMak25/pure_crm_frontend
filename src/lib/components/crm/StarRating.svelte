<script lang="ts">
	import Icon from '../ui/icon/Icon.svelte';

	// Three-star priority rating on pipeline cards (Figma yellow outline stars).
	interface Props {
		value?: number;
		max?: number;
		label?: string;
		onchange?: (value: number) => void;
	}
	let { value = $bindable(0), max = 3, label = 'Priority', onchange }: Props = $props();

	function select(next: number) {
		value = next;
		onchange?.(next);
	}
</script>

<div class="flex items-center gap-1" role="radiogroup" aria-label={label}>
	{#each Array(max) as _, i (i)}
		<button
			type="button"
			role="radio"
			aria-checked={value === i + 1}
			aria-label="{i + 1} star{i ? 's' : ''}"
			class="text-amber-400 transition-transform hover:scale-110"
			onclick={() => select(value === i + 1 ? 0 : i + 1)}
		>
			<Icon name="star" size={18} class={i < value ? 'fill-amber-400' : ''} />
		</button>
	{/each}
</div>
