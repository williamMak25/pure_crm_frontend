<script lang="ts">
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Visibility } from '#lib/types/index.ts';
	import Icon from '../ui/icon/Icon.svelte';
	import { VISIBILITY_OPTIONS } from './visibility';

	// Figma "Popup / Change Visibility" (226px), opened from the lock button.
	let { value, onchange, disabled = false }: { value: Visibility; onchange: (v: Visibility) => void; disabled?: boolean } = $props();
	let open = $state(false);
	const current = $derived(VISIBILITY_OPTIONS.find((o) => o.value === value) ?? VISIBILITY_OPTIONS[0]);
</script>

<Popover {open} onOpenChange={(e) => (open = e.open)} positioning={{ placement: 'bottom-end', gutter: 6 }}>
	<Popover.Trigger
		class="grid size-[34px] place-items-center rounded-md border border-brand-500 bg-white text-brand-500 hover:bg-brand-50 disabled:opacity-50"
		aria-label="Change visibility (currently {current.label})"
		{disabled}
	>
		<Icon name="lock" size={18} />
	</Popover.Trigger>
	<Portal>
		<Popover.Positioner class="z-50">
			<Popover.Content class="w-[226px] rounded-xl bg-white p-3 shadow-pop">
				<Popover.Title class="mb-3 text-md text-neutral-800">Change Visibility</Popover.Title>
				<ul class="flex flex-col gap-2">
					{#each VISIBILITY_OPTIONS as o (o.value)}
						<li>
							<button
								type="button"
								class="flex h-11 w-full items-center gap-2 rounded-md px-3 text-sm {o.value === value
									? 'bg-brand-50 text-brand-600'
									: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}"
								aria-pressed={o.value === value}
								onclick={() => {
									onchange(o.value);
									open = false;
								}}
							>
								<Icon name={o.icon} size={18} />{o.label}
							</button>
						</li>
					{/each}
				</ul>
			</Popover.Content>
		</Popover.Positioner>
	</Portal>
</Popover>
