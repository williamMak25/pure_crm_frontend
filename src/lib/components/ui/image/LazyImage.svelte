<script lang="ts">
	import Icon from '../icon/Icon.svelte';

	interface Props {
		src: string;
		alt: string;
		/** Reserve space up-front to prevent layout shift, e.g. "208 / 138". */
		aspect: string;
		width?: number;
		height?: number;
		eager?: boolean;
		class?: string;
		imgClass?: string;
	}

	let { src, alt, aspect, width, height, eager = false, class: className = '', imgClass = '' }: Props = $props();
	let status = $state<'loading' | 'loaded' | 'error'>('loading');
</script>

<div class="relative overflow-hidden bg-neutral-100 {className}" style:aspect-ratio={aspect}>
	{#if status === 'loading'}
		<div class="absolute inset-0 animate-pulse bg-neutral-200" aria-hidden="true"></div>
	{:else if status === 'error'}
		<div class="absolute inset-0 grid place-items-center text-neutral-400"><Icon name="image" size={28} /></div>
	{/if}
	<img
		{src}
		{alt}
		{width}
		{height}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		fetchpriority={eager ? 'high' : 'auto'}
		class="size-full object-cover transition-opacity duration-300 {status === 'loaded' ? 'opacity-100' : 'opacity-0'} {imgClass}"
		onload={() => (status = 'loaded')}
		onerror={() => (status = 'error')}
	/>
</div>
