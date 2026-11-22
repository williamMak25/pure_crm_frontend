<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { attendanceService } from '#lib/services/index.ts';
	import type { Attendance } from '#lib/types/index.ts';

	const columns: Column<Attendance>[] = [
		{ key: 'employee', label: 'Employee' },
		{ key: 'department', label: 'Department' },
		{ key: 'date', label: 'Date' },
		{ key: 'checkIn', label: 'Check In' },
		{ key: 'checkOut', label: 'Check Out' },
		{ key: 'hours', label: 'Working Hours' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Attendance · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="attendance"
	service={attendanceService}
	{columns}
	addLabel="Add Attendance"
	formTitle="Add New Attendance"
	fields={FORMS.attendance}
/>
