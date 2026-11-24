<script lang="ts">
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { contactService } from '#lib/services/index.ts';
	import type { Contact } from '#lib/types/index.ts';

	const columns: Column<Contact>[] = [
		{ key: 'name', label: 'Contact Name' },
		{ key: 'company', label: 'Company' },
		{ key: 'email', label: 'Email' },
		{ key: 'owner', label: 'Assigned Owner' },
		{ key: 'followUpDate', label: 'Follow-up Date', format: 'date' },
		{ key: 'status', label: 'Status', format: 'status' },
		{ key: 'id', label: 'Action', format: 'view' }
	];
</script>

<svelte:head><title>Contacts · PURE ERP</title></svelte:head>

<ResourcePage
	module={MODULES.crm}
	name="contacts"
	service={contactService}
	{columns}
	addLabel="Add Contact"
	formTitle="Add New Contact"
	fields={FORMS.contact}
/>
