<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/ui/button/Button.svelte';
	import EmptyState from '#lib/components/ui/state/EmptyState.svelte';
</script>

<div class="rounded-xl bg-white">
	<EmptyState
		icon="alert"
		title={page.status === 404 ? 'Page not found' : 'Something went wrong'}
		description={page.error?.message}
	>
		{#snippet action()}<Button href="/" size="lg" icon="overview">Back to Overview</Button>{/snippet}
	</EmptyState>
</div>
