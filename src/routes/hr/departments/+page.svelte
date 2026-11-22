<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { departmentService } from '#lib/services/index.ts';
	import type { Department } from '#lib/types/index.ts';

	const columns: Column<Department>[] = [
		{ key: 'name', label: 'Department' },
		{ key: 'head', label: 'Department Head' },
		{ key: 'business', label: 'Business' },
		{ key: 'employees', label: 'Employees', format: 'number' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Departments · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="departments"
	service={departmentService}
	{columns}
	addLabel="Add Department"
	formTitle="Add New Department"
	fields={FORMS.department}
/>
