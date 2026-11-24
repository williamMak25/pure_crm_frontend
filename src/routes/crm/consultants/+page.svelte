<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { consultantService } from '#lib/services/index.ts';
	import type { Consultant } from '#lib/types/index.ts';

	const columns: Column<Consultant>[] = [
		{ key: 'name', label: 'Consultant Name' },
		{ key: 'country', label: 'Country' },
		{ key: 'email', label: 'Email' },
		{ key: 'company', label: 'Company' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Consultants · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.crm}
	name="consultants"
	service={consultantService}
	{columns}
	addLabel="Add Consultant"
	formTitle="Add New Consultant"
	fields={FORMS.consultant}
/>
