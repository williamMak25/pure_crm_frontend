<script lang="ts">
	import type { FormField } from '#lib/constants/forms.ts';
	import { toPayload, validate, type FormErrors, type FormValues } from '#lib/utils/validation.ts';
	import Button from '../ui/button/Button.svelte';
	import Input from '../ui/input/Input.svelte';
	import Textarea from '../ui/input/Textarea.svelte';
	import Modal from '../ui/modal/Modal.svelte';
	import Select from '../ui/select/Select.svelte';

	// Figma "Add New … Form": 564px drawer, two-column grid, Cancel + Save.
	interface Props {
		open: boolean;
		title: string;
		fields: FormField[];
		initial?: FormValues;
		submitLabel?: string;
		pending?: boolean;
		/** Return true (or a resolved promise) to close the drawer. */
		onsubmit: (payload: Record<string, string | number>) => Promise<unknown> | void;
		onclose: () => void;
		placement?: 'drawer' | 'center';
		width?: number;
	}

	let {
		open = $bindable(),
		title,
		fields,
		initial = {},
		submitLabel = 'Save',
		pending = false,
		onsubmit,
		onclose,
		placement = 'drawer',
		width = 564
	}: Props = $props();

	const blank = () => Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ''])) as FormValues;
	let values = $state<FormValues>(blank());
	let errors = $state<FormErrors>({});
	let touched = $state(false);
	const formId = `form-${Math.random().toString(36).slice(2, 8)}`;

	function close() {
		values = blank();
		errors = {};
		touched = false;
		onclose();
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		touched = true;
		errors = validate(fields, values);
		if (Object.values(errors).some(Boolean)) {
			(document.querySelector(`#${formId} [aria-invalid="true"]`) as HTMLElement | null)?.focus();
			return;
		}
		try {
			await onsubmit(toPayload(fields, values));
			close();
		} catch {
			/* error toast is raised by the mutation */
		}
	}

	// Live re-validation after the first submit attempt.
	const liveErrors = $derived(touched ? validate(fields, values) : errors);
</script>

<Modal {open} {title} {placement} {width} onclose={close}>
	<form id={formId} novalidate onsubmit={submit} class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
		{#each fields as f (f.name)}
			<div class={f.full ? 'sm:col-span-2' : ''}>
				{#if f.type === 'select'}
					<Select
						bind:value={values[f.name]}
						label={f.label}
						required={f.required}
						options={f.options ?? []}
						placeholder={`Select ${f.label.toLowerCase()}`}
						error={liveErrors[f.name]}
					/>
				{:else if f.type === 'textarea'}
					<Textarea bind:value={values[f.name]} label={f.label} required={f.required} placeholder={f.placeholder} rows={3} error={liveErrors[f.name]} />
				{:else}
					<Input
						bind:value={values[f.name]}
						label={f.label}
						required={f.required}
						type={f.type ?? 'text'}
						inputmode={f.type === 'number' ? 'decimal' : undefined}
						placeholder={f.placeholder}
						error={liveErrors[f.name]}
					/>
				{/if}
			</div>
		{/each}
	</form>

	{#snippet footer()}
		<Button variant="outline-brand" size="lg" fullWidth onclick={close} disabled={pending}>Cancel</Button>
		<Button type="submit" form={formId} size="lg" fullWidth loading={pending}>{submitLabel}</Button>
	{/snippet}
</Modal>
