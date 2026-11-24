<script lang="ts">
	import { goto } from '$app/navigation';
	import ResourcePage from '#lib/components/tables/ResourcePage.svelte';
	import RecordDetailModal from '#lib/components/tables/RecordDetailModal.svelte';
	import type { Column } from '#lib/components/tables/types.ts';
	import StatusBadge from '#lib/components/ui/badge/StatusBadge.svelte';
	import Dropdown from '#lib/components/ui/dropdown/Dropdown.svelte';
	import Icon from '#lib/components/ui/icon/Icon.svelte';
	import { FORMS } from '#lib/constants/forms.ts';
	import { MODULES } from '#lib/constants/modules.ts';
	import { createMeQuery } from '#lib/queries/dashboard.ts';
	import { createLeadStatusMutation } from '#lib/queries/modules.ts';
	import { leadService } from '#lib/services/index.ts';
	import type { Lead, LeadStatus } from '#lib/types/index.ts';
	import { formatDate } from '#lib/utils/format.ts';

	// Leads are kept apart from students (Contact List). Changing a lead's status to "New" moves it into
	// the pipeline's New stage; it then shows "In Pipeline" here, with a link to its card.
	const columns: Column<Lead>[] = [
		{ key: 'name', label: 'Lead Name' },
		{ key: 'company', label: 'Company' },
		{ key: 'email', label: 'Email' },
		{ key: 'owner', label: 'Assigned Owner' },
		{ key: 'followUpDate', label: 'Follow-up Date', format: 'date' },
		{ key: 'status', label: 'Status', format: 'status', minWidth: 170 },
		{ key: 'id', label: 'Action', format: 'view' }
	];

	const me = createMeQuery();
	const canUpdate = $derived(!!me.data && (me.data.isSuperuser || !!me.data.permissions?.crm?.includes('update')));
	const openDeal = (dealId: string) => goto(`/crm/pipeline?deal=${dealId}`);
	const setStatus = createLeadStatusMutation(openDeal);
	let viewing = $state<Lead | null>(null);

	const STATUS_ITEMS: { value: LeadStatus; label: string }[] = [
		{ value: 'Open', label: 'Open' },
		{ value: 'Contacted', label: 'Contacted' },
		{ value: 'New', label: 'New: move to pipeline' },
		{ value: 'Lost', label: 'Lost' }
	];
</script>

<svelte:head><title>Leads · PURE ERP</title></svelte:head>

{#snippet cell(lead: Lead, col: Column<Lead>)}
	{#if col.key === 'status'}
		{#if lead.status === 'In Pipeline' && lead.dealId}
			<span class="inline-flex items-center gap-2">
				<StatusBadge status="In Pipeline" />
				<button type="button" class="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline" onclick={() => openDeal(lead.dealId!)}>
					Open deal<Icon name="arrowRight" size={14} />
				</button>
			</span>
		{:else if canUpdate}
			<Dropdown
				items={STATUS_ITEMS}
				selected={lead.status}
				placement="bottom-start"
				onselect={(v) => v !== lead.status && setStatus.mutate({ id: lead.id, status: v as LeadStatus })}
				triggerLabel="Change status of {lead.name} (now {lead.status})"
				triggerClass="inline-flex items-center gap-1 rounded-md hover:bg-neutral-100"
			>
				{#snippet trigger()}<StatusBadge status={lead.status} /><Icon name="chevronDown" size={16} class="text-neutral-500" />{/snippet}
			</Dropdown>
		{:else}
			<StatusBadge status={lead.status} />
		{/if}
	{:else if col.key === 'followUpDate'}
		{formatDate(lead.followUpDate)}
	{:else if col.format === 'view'}
		<button type="button" class="inline-flex items-center gap-1.5 rounded px-1 text-neutral-700 hover:text-brand-600" onclick={() => (viewing = lead)}>
			<Icon name="eye" size={20} /> View
		</button>
	{:else}
		{lead[col.key] ?? ''}
	{/if}
{/snippet}

<ResourcePage
	module={MODULES.crm}
	name="leads"
	service={leadService}
	{columns}
	{cell}
	onview={(lead) => (viewing = lead)}
	addLabel="Add Lead"
	formTitle="Add New Lead"
	fields={FORMS.lead}
/>

<RecordDetailModal row={viewing} {columns} title="Lead Details" onclose={() => (viewing = null)} />
