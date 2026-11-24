<script lang="ts">
	import { untrack } from 'svelte';
	import { createCrmPeopleQuery } from '#lib/queries/modules.ts';
	import { createListQuery } from '#lib/queries/resource.ts';
	import { consultantService, universityService } from '#lib/services/index.ts';
	import { ui } from '#lib/stores/ui.svelte.ts';
	import type { DealDetail, DealInput, DealUpdate } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Input from '../ui/input/Input.svelte';
	import Select from '../ui/select/Select.svelte';

	// Figma "Edit Pipeline" left card: contact details, owner, tags and the lead's university.
	// Without `deal` it is the "Add Deal" form for a stage.
	interface Props {
		deal?: DealDetail;
		/** Lock button in the timeline header makes the form read-only. */
		locked?: boolean;
		saving?: boolean;
		oncreate?: (body: DealInput) => Promise<unknown>;
		onupdate?: (body: DealUpdate) => Promise<unknown>;
		oncancel?: () => void;
	}
	let { deal, locked = false, saving = false, oncreate, onupdate, oncancel }: Props = $props();

	// Pickers list the selected company's people, consultants and universities.
	const people = createCrmPeopleQuery(() => ui.companyId);
	const listParams = { pageSize: 100, status: 'Active' };
	const consultants = createListQuery(() => ({ name: 'consultants', service: consultantService, params: listParams }));
	const universities = createListQuery(() => ({ name: 'universities', service: universityService, params: listParams }));

	// "2026-10-14T13:45:00Z" ⇄ the local "2026-10-14T20:15" a datetime-local input needs.
	const toLocalInput = (iso: string) => {
		const d = new Date(iso);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
	};

	function fromDeal(d?: DealDetail) {
		return {
			contact: d?.name ?? '',
			email: d?.email ?? '',
			phone: d?.phone ?? '',
			socialMediaLink: d?.socialMediaLink ?? '',
			openedAt: d ? toLocalInput(d.openedAt) : '',
			consultantId: d?.consultant?.id ?? '',
			owner: d?.owner?.id ?? '',
			date: d?.date ?? '',
			tags: [...(d?.tags ?? [])],
			universityId: d?.university?.id ?? ''
		};
	}
	// The parent re-keys this component when the saved deal changes.
	let form = $state(fromDeal(untrack(() => deal)));
	let tagDraft = $state('');
	let error = $state('');
	const dirty = $derived(!deal || JSON.stringify(form) !== JSON.stringify(fromDeal(deal)));

	function addTag() {
		const tag = tagDraft.trim();
		if (tag && !form.tags.includes(tag)) form.tags.push(tag);
		tagDraft = '';
	}
	// One university per lead. Keep the saved one listed even if it is no longer active.
	const universityOptions = $derived.by(() => {
		const items = (universities.data?.items ?? []).map((u) => ({ label: u.name, value: u.id }));
		const saved = deal?.university;
		return saved && !items.some((o) => o.value === saved.id) ? [{ label: saved.name, value: saved.id }, ...items] : items;
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = form.contact.trim() ? '' : 'Contact is required';
		if (error) return;
		const blank = (v: string) => v.trim() || null;
		try {
			if (deal) {
				await onupdate?.({
					contact: form.contact.trim(),
					email: blank(form.email),
					phone: blank(form.phone),
					socialMediaLink: blank(form.socialMediaLink),
					openedAt: form.openedAt ? new Date(form.openedAt).toISOString() : undefined,
					consultantId: form.consultantId || null,
					owner: form.owner || undefined,
					date: form.date || undefined,
					tags: form.tags,
					universityId: form.universityId || null
				});
			} else {
				await oncreate?.({
					name: form.contact.trim(),
					email: form.email.trim() || undefined,
					phone: form.phone.trim() || undefined,
					socialMediaLink: form.socialMediaLink.trim() || undefined,
					consultantId: form.consultantId || undefined,
					owner: form.owner || undefined,
					date: form.date || undefined,
					tags: form.tags,
					universityId: form.universityId || undefined
				});
			}
		} catch {
			/* the mutation shows the error toast */
		}
	}
</script>

<form class="flex flex-col gap-4" onsubmit={submit} novalidate>
	<fieldset disabled={locked} class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
		<Input bind:value={form.contact} label="Contact" required placeholder="Enter contact name" error={error || undefined} />
		<Input bind:value={form.email} label="Email" type="email" placeholder="name@example.com" />
		<Input bind:value={form.phone} label="Phone Number" type="tel" placeholder="+959 xxx xxx xxx" />
		<Input bind:value={form.socialMediaLink} label="Social Media Link" required placeholder="https://www.facebook.com" />
		{#if deal}
			<Input bind:value={form.openedAt} label="Created On" type="datetime-local" required />
		{/if}
		<Select
			bind:value={form.consultantId}
			label="Consultant By"
			required
			placeholder="Select consultant"
			options={(consultants.data?.items ?? []).map((c) => ({ label: c.name, value: c.id }))}
		/>
		<Select
			bind:value={form.owner}
			label="Saleperson"
			required
			placeholder="You"
			options={(people.data ?? []).map((p) => ({ label: p.name, value: p.id }))}
		/>
		<Input bind:value={form.date} label="Expected Closing" type="date" required placeholder="No closing estimate" />

		<div class="flex flex-col gap-2 sm:col-span-2">
			<label for="deal-tags" class="text-sm text-neutral-800">Tags <span class="text-brand-600">*</span></label>
			<div class="flex h-[42px] items-center gap-2 rounded-lg border border-neutral-200 px-3 focus-within:border-brand-500">
				<input
					id="deal-tags"
					bind:value={tagDraft}
					placeholder="Add Tags"
					class="h-full w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-neutral-400 focus:ring-0"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addTag();
						}
					}}
				/>
				<button type="button" class="text-neutral-700 hover:text-brand-600" aria-label="Add tag" onclick={addTag}><Icon name="plus" size={20} /></button>
			</div>
			{#if form.tags.length}
				<div class="flex flex-wrap gap-2">
					{#each form.tags as tag (tag)}
						<span class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700">
							{tag}
							<button type="button" aria-label="Remove {tag}" class="text-neutral-700 hover:text-brand-600" onclick={() => (form.tags = form.tags.filter((t) => t !== tag))}>
								<Icon name="close" size={14} />
							</button>
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-1.5 sm:col-span-2">
			<Select bind:value={form.universityId} label="University" required placeholder="Select university" options={universityOptions} />
			{#if universities.isSuccess && !universityOptions.length}
				<span class="text-xs text-neutral-500">No active universities in {ui.business} yet.</span>
			{/if}
		</div>
	</fieldset>

	{#if !locked}
		<div class="flex justify-end gap-3 border-t border-neutral-100 pt-4">
			{#if deal}
				<Button variant="outline" size="md" disabled={!dirty} onclick={() => (form = fromDeal(deal))}>Reset</Button>
			{:else}
				<Button variant="outline" size="md" onclick={oncancel}>Cancel</Button>
			{/if}
			<Button type="submit" size="md" disabled={!dirty} loading={saving}>{deal ? 'Save Changes' : 'Add Deal'}</Button>
		</div>
	{/if}
</form>
