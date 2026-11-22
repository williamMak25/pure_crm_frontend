<script lang="ts">
	let { size = 16, class: className = '' }: { size?: number; class?: string } = $props();
</script>

<span
	class="inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent {className}"
	style:width="{size}px"
	style:height="{size}px"
	role="status"
	aria-label="Loading"
></span>
