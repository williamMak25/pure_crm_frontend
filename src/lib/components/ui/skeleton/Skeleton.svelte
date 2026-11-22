<script lang="ts">
	interface Props {
		width?: string;
		height?: string;
		rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		class?: string;
	}
	let { width = '100%', height = '1rem', rounded = 'md', class: className = '' }: Props = $props();
	const r = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' };
</script>

<span
	class="block shrink-0 animate-shimmer bg-[length:800px_100%] bg-gradient-to-r from-neutral-100 via-neutral-200/80 to-neutral-100 {r[rounded]} {className}"
	style:width
	style:height
	aria-hidden="true"
></span>
