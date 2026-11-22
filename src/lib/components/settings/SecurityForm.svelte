<script lang="ts">
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { SecuritySettings } from '#lib/types/index.ts';
	import Button from '../ui/button/Button.svelte';
	import Input from '../ui/input/Input.svelte';
	import Select from '../ui/select/Select.svelte';
	import Toggle from '../ui/toggle/Toggle.svelte';

	// Figma "Security" rows (521×50): toggles + selects, plus change-password.
	interface Props {
		initial: SecuritySettings;
		saving: boolean;
		onsave: (s: SecuritySettings) => void;
	}
	let { initial, saving, onsave }: Props = $props();

	// Draft copy; the parent re-keys this component when server data changes.
	let settings = $state(structuredClone(untrack(() => initial)));
	const dirty = $derived(JSON.stringify(settings) !== JSON.stringify(initial));

	let pw = $state({ current: '', next: '', confirm: '' });
	let pwErrors = $state<Record<string, string>>({});

	function changePassword(e: SubmitEvent) {
		e.preventDefault();
		pwErrors = {};
		if (!pw.current) pwErrors.current = 'Enter your current password';
		if (pw.next.length < 8) pwErrors.next = 'Use at least 8 characters';
		if (pw.confirm !== pw.next) pwErrors.confirm = 'Passwords do not match';
		if (Object.keys(pwErrors).length) return;
		// Connect to your auth provider's change-password endpoint here.
		toast.success('Password updated');
		pw = { current: '', next: '', confirm: '' };
	}
</script>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
	<section class="flex flex-col gap-5 rounded-xl bg-white p-4 sm:p-5">
		<h2 class="text-md font-medium text-neutral-800">Login & Sessions</h2>
		<Toggle checked={settings.twoFactor} label="Two-factor authentication" description="Require a verification code at sign-in." onchange={(v) => (settings.twoFactor = v)} />
		<Toggle checked={settings.loginAlerts} label="Login alerts" description="Email me when a new device signs in." onchange={(v) => (settings.loginAlerts = v)} />
		<Select bind:value={settings.sessionTimeout} label="Session timeout" options={['15 minutes', '30 minutes', '1 hour', '8 hours']} />
		<Select bind:value={settings.passwordExpiry} label="Password expiry" options={['30 days', '60 days', '90 days', 'Never']} />
		<div class="flex justify-end gap-3 border-t border-neutral-100 pt-4">
			<Button variant="outline" size="md" disabled={!dirty} onclick={() => (settings = structuredClone(initial))}>Cancel</Button>
			<Button size="md" disabled={!dirty} loading={saving} onclick={() => onsave($state.snapshot(settings))}>Save Changes</Button>
		</div>
	</section>

	<form class="flex flex-col gap-4 rounded-xl bg-white p-4 sm:p-5" onsubmit={changePassword} novalidate>
		<h2 class="text-md font-medium text-neutral-800">Change Password</h2>
		<Input bind:value={pw.current} label="Current Password" type="password" autocomplete="current-password" required error={pwErrors.current} />
		<Input bind:value={pw.next} label="New Password" type="password" autocomplete="new-password" required error={pwErrors.next} hint="At least 8 characters" />
		<Input bind:value={pw.confirm} label="Confirm New Password" type="password" autocomplete="new-password" required error={pwErrors.confirm} />
		<Button type="submit" size="lg" icon="key" class="self-end">Update Password</Button>
	</form>
</div>
