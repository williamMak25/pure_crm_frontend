<script lang="ts">
	import { untrack } from 'svelte';
	import type { Branch, Company } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Input from '../ui/input/Input.svelte';
	import Textarea from '../ui/input/Textarea.svelte';
	import Select from '../ui/select/Select.svelte';
	import Toggle from '../ui/toggle/Toggle.svelte';

	// Figma "Company Management" — variants "No Branch" and "Include branch".
	// Edits the company selected in the navbar switcher; every company has its own details and branches.
	interface Props {
		initial: Company;
		saving: boolean;
		onsave: (c: Company) => void;
	}
	let { initial, saving, onsave }: Props = $props();

	// Draft copy; the parent re-keys this component when server data changes.
	let company = $state<Company>(structuredClone(untrack(() => initial)));
	let errors = $state<Record<string, string>>({});
	const dirty = $derived(JSON.stringify(company) !== JSON.stringify(initial));

	const addBranch = () =>
		company.branches.push({ id: `new-${crypto.randomUUID()}`, name: '', address: '', phone: '' } satisfies Branch);
	const removeBranch = (id: string) => (company.branches = company.branches.filter((b) => b.id !== id));

	function submit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		if (!company.name.trim()) errors.name = 'Company name is required';
		if (!/^\S+@\S+\.\S+$/.test(company.email)) errors.email = 'Enter a valid email address';
		if (company.hasBranches) {
			for (const b of company.branches) if (!b.name.trim()) errors[`branch-${b.id}`] = 'Branch name is required';
		}
		if (Object.keys(errors).length) return;
		onsave($state.snapshot(company));
	}
</script>

<form class="flex flex-col gap-6" onsubmit={submit} novalidate>
	<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5">
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<h2 class="text-md font-medium text-neutral-800">Company Information</h2>
			<span class="text-sm text-neutral-500">{initial.members} {initial.members === 1 ? 'member' : 'members'}</span>
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Input bind:value={company.name} label="Company Name" required error={errors.name} />
			<Input bind:value={company.email} label="Email" type="email" required error={errors.email} />
			<Input bind:value={company.phone} label="Phone Number" type="tel" />
			<Select bind:value={company.currency} label="Currency" options={['MMK', 'USD', 'THB', 'SGD']} />
			<Select bind:value={company.timezone} label="Time Zone" options={['Asia/Yangon', 'Asia/Bangkok', 'Asia/Singapore', 'UTC']} />
			<Textarea bind:value={company.address} label="Address" rows={2} class="md:col-span-2" />
		</div>
	</section>

	<section class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5">
		<Toggle
			checked={company.hasBranches}
			label="Include branch"
			description="Turn on if this company operates from more than one location."
			onchange={(v) => (company.hasBranches = v)}
		/>
		{#if company.hasBranches}
			<ul class="flex flex-col gap-3">
				{#each company.branches as branch, i (branch.id)}
					<li class="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-[1fr_1.4fr_1fr_auto] md:items-end">
						<Input bind:value={company.branches[i].name} label="Branch Name" required error={errors[`branch-${branch.id}`]} />
						<Input bind:value={company.branches[i].address} label="Address" />
						<Input bind:value={company.branches[i].phone} label="Phone" type="tel" />
						<button type="button" class="grid size-[42px] place-items-center rounded-lg border border-neutral-200 text-brand-600 hover:bg-brand-50" aria-label="Remove {branch.name || 'branch'}" onclick={() => removeBranch(branch.id)}>
							<Icon name="trash" size={18} />
						</button>
					</li>
				{:else}
					<li class="text-sm text-neutral-500">No branches yet.</li>
				{/each}
			</ul>
			<Button variant="outline" size="md" icon="plus" class="self-start" onclick={addBranch}>Add Branch</Button>
		{/if}
	</section>

	<div class="flex justify-end gap-3">
		<Button variant="outline" size="lg" disabled={!dirty} onclick={() => (company = structuredClone(initial))}>Cancel</Button>
		<Button type="submit" size="lg" disabled={!dirty} loading={saving}>Save Changes</Button>
	</div>
</form>
