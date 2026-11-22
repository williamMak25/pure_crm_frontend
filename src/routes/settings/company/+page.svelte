<script lang="ts">
	import CompanyForm from '#lib/components/settings/CompanyForm.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { createCompanyQuery, createSaveCompanyMutation } from '#lib/queries/modules.ts';

	const company = createCompanyQuery();
	const save = createSaveCompanyMutation();
</script>

<svelte:head><title>Company Management · PURE Education ERP</title></svelte:head>

{#if company.isPending}
	<div class="flex flex-col gap-4 rounded-xl bg-white p-5" aria-busy="true">
		<Skeleton width="200px" height="20px" />
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each Array(6) as _, i (i)}<div class="flex flex-col gap-2"><Skeleton width="30%" height="14px" /><Skeleton height="42px" rounded="lg" /></div>{/each}
		</div>
	</div>
{:else if company.isError}
	<div class="rounded-xl bg-white"><ErrorState error={company.error} onretry={() => company.refetch()} /></div>
{:else}
	{#key company.dataUpdatedAt}
		<CompanyForm initial={company.data} saving={save.isPending} onsave={(c) => save.mutate(c)} />
	{/key}
{/if}
