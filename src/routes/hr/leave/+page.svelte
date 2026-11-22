<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { leaveService } from '#lib/services/index.ts';
	import type { LeaveRequest } from '#lib/types/index.ts';

	const columns: Column<LeaveRequest>[] = [
		{ key: 'employee', label: 'Employee' },
		{ key: 'leaveType', label: 'Leave Type' },
		{ key: 'from', label: 'From' },
		{ key: 'to', label: 'To' },
		{ key: 'days', label: 'Days', format: 'number' },
		{ key: 'reason', label: 'Reason' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Leave · PURE Education ERP</title></svelte:head>

<ResourcePage
	module={MODULES.hr}
	name="leaves"
	service={leaveService}
	{columns}
	addLabel="Request Leave"
	formTitle="Add New Leave Request"
	fields={FORMS.leave}
/>
