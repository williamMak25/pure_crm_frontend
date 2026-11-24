<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { UserWithPassword } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Icon from '../ui/icon/Icon.svelte';
	import Modal from '../ui/modal/Modal.svelte';

	// Shown once after "Add User" or "Reset password". There is no email service yet,
	// so the admin passes the temporary password on themselves.
	let { result, title, onclose }: { result: UserWithPassword | null; title: string; onclose: () => void } = $props();

	async function copy() {
		if (!result?.temporaryPassword) return;
		await navigator.clipboard?.writeText(result.temporaryPassword);
		toast.success('Password copied');
	}
</script>

<Modal open={!!result} {title} width={460} {onclose}>
	{#if result}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-neutral-700">
				Share this temporary password with <span class="font-medium text-neutral-800">{result.user.name}</span>
				({result.user.email}). It won't be shown again; they can change it under Settings → Security.
			</p>
			<div class="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
				<code class="flex-1 font-mono text-md tracking-wide text-neutral-800" aria-label="Temporary password">{result.temporaryPassword}</code>
				<button type="button" class="grid size-8 place-items-center rounded-md text-neutral-600 hover:bg-neutral-200" aria-label="Copy password" onclick={copy}>
					<Icon name="copy" size={18} />
				</button>
			</div>
		</div>
	{/if}
	{#snippet footer()}
		<Button size="lg" fullWidth onclick={onclose}>Done</Button>
	{/snippet}
</Modal>
