<script lang="ts">
	// Outline tags on pipeline cards ("Airline Business" green, "Tiktok" pink).
	let { label, tone = 'green' }: { label: string; tone?: 'green' | 'pink' | 'blue' } = $props();
	const tones = {
		green: 'border-green-500 text-green-500',
		pink: 'border-pink-400 text-pink-500',
		blue: 'border-blue-500 text-blue-500'
	};
</script>

<span class="inline-flex h-[18px] items-center rounded-full border px-1.5 text-[10px] leading-none {tones[tone]}">{label}</span>
