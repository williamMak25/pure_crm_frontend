<script lang="ts">
	import { untrack } from 'svelte';
	import type { ModulePermission } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import PermissionMatrix from './PermissionMatrix.svelte';

	// Owns an editable copy of one role's permissions. The parent re-keys this
	// component when the role or server data changes, which resets the draft.
	interface Props {
		initial: ModulePermission[];
		readonly: boolean;
		saving: boolean;
		onsave: (rows: ModulePermission[]) => void;
	}
	let { initial, readonly, saving, onsave }: Props = $props();

	let rows = $state(structuredClone(untrack(() => initial)));
	const dirty = $derived(JSON.stringify(rows) !== JSON.stringify(initial));
</script>

<PermissionMatrix bind:rows {readonly} />
<div class="flex justify-end gap-3 border-t border-neutral-100 pt-3">
	<Button variant="outline" size="md" disabled={!dirty} onclick={() => (rows = structuredClone(initial))}>Reset</Button>
	<Button size="md" disabled={!dirty || readonly} loading={saving} onclick={() => onsave($state.snapshot(rows))}>Save Changes</Button>
</div>
