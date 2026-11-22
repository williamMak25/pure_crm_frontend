<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import Icon from '../icon/Icon.svelte';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		open: boolean;
		title?: string;
		/** "center" = Create/Share Board popups, "drawer" = right-side "Add New …" forms. */
		placement?: 'center' | 'drawer';
		/** Max width in px (Figma: 426 / 480 / 564). */
		width?: number;
		/** Center the title like "Create Board" / "Share Board". */
		centerTitle?: boolean;
		onclose: () => void;
		children: Snippet;
		footer?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(),
		title,
		placement = 'center',
		width = 480,
		centerTitle = false,
		onclose,
		children,
		footer,
		class: className
	}: Props = $props();
</script>

<Dialog
	{open}
	onOpenChange={(e) => {
		if (!e.open) onclose();
	}}
>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-[1px] transition-opacity data-[state=closed]:opacity-0" />
		<Dialog.Positioner
			class={cn(
				'fixed inset-0 z-50 flex',
				placement === 'center' ? 'items-end justify-center p-0 sm:items-center sm:p-4' : 'justify-end'
			)}
		>
			<Dialog.Content
				class={cn(
					'flex max-h-full w-full flex-col bg-white shadow-pop',
					placement === 'center'
						? 'max-h-[92dvh] rounded-t-2xl sm:rounded-xl'
						: 'h-dvh rounded-none sm:rounded-l-xl',
					className
				)}
				style="max-width: {width}px"
			>
				{#if title}
					<header class="relative flex shrink-0 items-center gap-3 px-3 pt-3 pb-1 sm:px-5 sm:pt-5">
						<Dialog.Title class={cn('flex-1 text-md font-medium text-neutral-800', centerTitle && 'text-center')}>
							{title}
						</Dialog.Title>
						<Dialog.CloseTrigger class="absolute right-3 inline-flex size-6 items-center justify-center rounded text-brand-600 hover:bg-brand-50 sm:right-5" aria-label="Close">
							<Icon name="close" size={22} />
						</Dialog.CloseTrigger>
					</header>
				{/if}
				<div class="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 sm:px-5">
					{@render children()}
				</div>
				{#if footer}
					<footer class="flex shrink-0 gap-4 border-t border-neutral-100 px-3 py-4 sm:px-5">
						{@render footer()}
					</footer>
				{/if}
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
