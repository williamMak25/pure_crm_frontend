<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useQueryClient } from '@tanstack/svelte-query';
	import Button from '#lib/components/ui/button/Button.svelte';
	import Input from '#lib/components/ui/input/Input.svelte';
	import { queryKeys } from '#lib/queries/keys.ts';
	import { ApiError } from '#lib/services/http.ts';
	import { authService } from '#lib/services/index.ts';

	const client = useQueryClient();
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let pending = $state(false);

	// Only same-site paths, so a crafted ?next= link can't send people elsewhere.
	const next = $derived.by(() => {
		const target = page.url.searchParams.get('next') ?? '/';
		return target.startsWith('/') && !target.startsWith('//') ? target : '/';
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		pending = true;
		try {
			const user = await authService.login({ email: email.trim(), password });
			client.clear();
			client.setQueryData(queryKeys.app.me, user);
			await goto(next, { replaceState: true });
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'Could not reach the server. Try again.';
		} finally {
			pending = false;
		}
	}
</script>

<svelte:head><title>Sign in · PURE ERP</title></svelte:head>

<div class="grid min-h-dvh place-items-center bg-neutral-50 px-4">
	<div class="flex w-full max-w-[400px] flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
		<div class="flex flex-col items-center gap-3 text-center">
			<img src="/images/logo.png" alt="" class="h-12 w-auto" />
			<div class="flex flex-col gap-1">
				<h1 class="text-xl font-semibold text-neutral-800">Sign in</h1>
				<p class="text-sm text-neutral-500">PURE ERP</p>
			</div>
		</div>

		<form class="flex flex-col gap-4" onsubmit={submit} novalidate>
			<Input bind:value={email} label="Email" type="email" autocomplete="username" required placeholder="name@example.com" />
			<Input bind:value={password} label="Password" type="password" autocomplete="current-password" required />
			{#if error}
				<p role="alert" class="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</p>
			{/if}
			<Button type="submit" size="lg" fullWidth loading={pending} disabled={!email || !password}>Sign in</Button>
		</form>
	</div>
</div>
