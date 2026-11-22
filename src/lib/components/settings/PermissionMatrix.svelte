<script lang="ts">
	import type { ModulePermission, PermissionAction } from '#lib/types/index.ts';
	import Checkbox from '../ui/checkbox/Checkbox.svelte';

	// Figma "Settings Content": Module | Create Read Update Delete Approve | All, 45px rows.
	let { rows = $bindable(), readonly = false }: { rows: ModulePermission[]; readonly?: boolean } = $props();

	const ACTIONS: { key: PermissionAction; label: string }[] = [
		{ key: 'create', label: 'Create' },
		{ key: 'read', label: 'Read' },
		{ key: 'update', label: 'Update' },
		{ key: 'delete', label: 'Delete' },
		{ key: 'approve', label: 'Approve' }
	];

	const allOn = (r: ModulePermission) => ACTIONS.every((a) => r.actions[a.key]);
	const setAll = (i: number, v: boolean) => {
		for (const a of ACTIONS) rows[i].actions[a.key] = v;
	};
</script>

<div class="scrollbar-thin overflow-x-auto">
	<table class="w-full min-w-[640px] border-collapse text-sm">
		<caption class="sr-only">Module permissions</caption>
		<thead>
			<tr class="h-11 border-b border-neutral-200 text-left text-neutral-800">
				<th scope="col" class="w-[196px] px-3 font-medium">Module</th>
				{#each ACTIONS as a (a.key)}<th scope="col" class="px-3 text-center font-medium">{a.label}</th>{/each}
				<th scope="col" class="w-16 px-3 text-center font-medium">All</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (row.module)}
				<tr class="h-[45px] border-b border-neutral-100 last:border-0">
					<th scope="row" class="px-3 text-left font-normal text-neutral-700">{row.module}</th>
					{#each ACTIONS as a (a.key)}
						<td class="px-3 text-center">
							<Checkbox
								bind:checked={rows[i].actions[a.key]}
								disabled={readonly}
								class="justify-center"
							>
								<span class="sr-only">{a.label} {row.module}</span>
							</Checkbox>
						</td>
					{/each}
					<td class="px-3 text-center">
						<Checkbox checked={allOn(row)} disabled={readonly} onchange={(v) => setAll(i, v)} class="justify-center">
							<span class="sr-only">All permissions for {row.module}</span>
						</Checkbox>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
