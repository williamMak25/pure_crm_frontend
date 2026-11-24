<script lang="ts">
	import CompanyForm from '#lib/components/settings/CompanyForm.svelte';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Input from '#lib/components/ui/input/Input.svelte';
	import Modal from '#lib/components/ui/modal/Modal.svelte';
	import Skeleton from '#lib/components/ui/skeleton/Skeleton.svelte';
	import ErrorState from '#lib/components/ui/state/ErrorState.svelte';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import {
		createAddCompanyMutation,
		createCompanyQuery,
		createDeleteCompanyMutation,
		createSaveCompanyMutation
	} from '#lib/queries/modules.ts';

	// Edits the company selected in the navbar switcher. Super admins can also add and delete companies.
	const company = createCompanyQuery();
	const save = createSaveCompanyMutation();
	const me = createMeQuery();
	const isSuperAdmin = $derived(me.data?.isSuperuser ?? false);

	let addOpen = $state(false);
	let newName = $state('');
	let nameError = $state('');
	const add = createAddCompanyMutation(() => {
		addOpen = false;
		newName = '';
	});
	const remove = createDeleteCompanyMutation();

	function submitNew(e: SubmitEvent) {
		e.preventDefault();
		nameError = newName.trim() ? '' : 'Company name is required';
		if (!nameError) add.mutate(newName.trim());
	}
	function deleteCompany() {
		const c = company.data;
		if (c && confirm(`Delete ${c.name}? This only works if it has no records left. It can't be undone.`)) remove.mutate(c.id);
	}
</script>

<svelte:head><title>Company Management · PURE ERP</title></svelte:head>

{#if isSuperAdmin}
	<div class="flex justify-end">
		<Button size="lg" icon="plus" onclick={() => (addOpen = true)}>Add Company</Button>
	</div>
{/if}

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

	{#if isSuperAdmin}
		<section class="flex flex-col gap-3 rounded-xl border border-brand-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-label="Delete company">
			<div class="flex flex-col gap-1">
				<h2 class="text-md font-medium text-neutral-800">Delete {company.data.name}</h2>
				<p class="text-sm text-neutral-500">Only possible once it has no contacts, boards or other records left.</p>
			</div>
			<Button variant="outline-brand" size="md" icon="trash" loading={remove.isPending} onclick={deleteCompany}>Delete company</Button>
		</section>
	{/if}
{/if}

<Modal open={addOpen} title="Add Company" centerTitle width={426} onclose={() => ((addOpen = false), (newName = ''), (nameError = ''))}>
	<form class="flex flex-col gap-5" onsubmit={submitNew} novalidate>
		<Input bind:value={newName} label="Company Name" required placeholder="Enter company name" error={nameError || undefined} oninput={() => (nameError = '')} />
		<p class="text-sm text-neutral-500">It starts with the default roles and pipeline, and you'll switch to it right away.</p>
		<Button type="submit" size="lg" fullWidth loading={add.isPending}>Add Company</Button>
	</form>
</Modal>
