<script lang="ts" generics="T extends { id: string }">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { FormField } from '#lib/constants/forms.ts';
	import type { ModuleTab } from '#lib/constants/navigation.ts';
	import { createCreateMutation } from '#lib/queries/resource.ts';
	import type { ResourceService } from '#lib/services/resource.service.ts';
	import FormDrawer from '../forms/FormDrawer.svelte';
	import ModuleLayout from '../layout/ModuleLayout.svelte';
	import Button from '../ui/button/Button.svelte';
	import RecordDetailModal from './RecordDetailModal.svelte';
	import ResourceTable from './ResourceTable.svelte';
	import type { Column } from './types';

	/**
	 * A complete tabbed list screen: module header + tabs + "Add …" button,
	 * searchable/paginated table and the matching "Add New …" drawer.
	 * Used by CRM, Sales, Invoices, Finance and HR tabs.
	 */
	interface Props {
		module: { title: string; description: string; tabs: ModuleTab[] };
		name: string;
		service: ResourceService<T, any>;
		columns: Column<T>[];
		addLabel: string;
		formTitle: string;
		fields: FormField[];
		rowHref?: (row: T) => string;
		onview?: (row: T) => void;
		cell?: Snippet<[T, Column<T>]>;
		filters?: Record<string, string>;
		filterControls?: Snippet;
	}

	let { module, name, service, columns, addLabel, formTitle, fields, rowHref, onview, cell, filters, filterControls }: Props =
		$props();

	let formOpen = $state(false);
	let viewing = $state<T | null>(null);
	// Each route mounts its own ResourcePage, so these props are fixed for its lifetime.
	const create = untrack(() =>
		createCreateMutation(name, service, { successMessage: `${formTitle.replace('Add New ', '')} added` })
	);
</script>

<ModuleLayout title={module.title} description={module.description} tabs={module.tabs}>
	{#snippet action()}
		<Button size="lg" icon="plus" onclick={() => (formOpen = true)}>{addLabel}</Button>
	{/snippet}

	<ResourceTable {name} {service} {columns} caption={addLabel.replace('Add ', '') + ' list'} {rowHref}
		onview={onview ?? ((r) => (viewing = r))}
		{cell}
		{filters}
		{filterControls}
	/>
</ModuleLayout>

<RecordDetailModal row={viewing} {columns} title={formTitle.replace('Add New ', '') + ' Details'} onclose={() => (viewing = null)} />

<FormDrawer
	bind:open={formOpen}
	title={formTitle}
	{fields}
	pending={create.isPending}
	onsubmit={(payload) => create.mutateAsync(payload)}
	onclose={() => (formOpen = false)}
/>
