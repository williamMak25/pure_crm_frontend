<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { universityService } from '#lib/services/index.ts';
	import type { University } from '#lib/types/index.ts';

	const columns: Column<University>[] = [
		{ key: 'name', label: 'University Name' },
		{ key: 'country', label: 'Country' },
		{ key: 'email', label: 'Email' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Universities · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.crm}
	name="universities"
	service={universityService}
	{columns}
	addLabel="Add University"
	formTitle="Add New University"
	fields={FORMS.university}
/>
