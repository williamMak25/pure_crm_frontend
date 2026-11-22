<script lang="ts" module>
	import type { IconName } from '#lib/constants/icons.ts';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type ButtonVariant = 'primary' | 'outline' | 'outline-brand' | 'soft' | 'ghost' | 'tab' | 'tab-active';
	export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

	type Common = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		icon?: IconName;
		iconRight?: IconName;
		loading?: boolean;
		fullWidth?: boolean;
		class?: string;
		children?: Snippet;
	};

	export type ButtonProps = Common &
		((HTMLButtonAttributes & { href?: undefined }) | (HTMLAnchorAttributes & { href: string }));
</script>

<script lang="ts">
	import Icon from '../icon/Icon.svelte';
	import Spinner from '../spinner/Spinner.svelte';
	import { cn } from '#lib/utils/cn.ts';

	let {
		variant = 'primary',
		size = 'md',
		icon,
		iconRight,
		loading = false,
		fullWidth = false,
		class: className,
		children,
		...rest
	}: ButtonProps = $props();

	// Figma: Fill button (Brand/500), outline "View All" (Neutral/300), tab pills (Neutral/100 → Brand/600).
	const variants: Record<ButtonVariant, string> = {
		primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-200',
		outline: 'border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 disabled:text-neutral-400',
		'outline-brand': 'border border-brand-500 bg-white text-brand-500 hover:bg-brand-50',
		soft: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
		ghost: 'text-neutral-700 hover:bg-neutral-100',
		tab: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
		'tab-active': 'bg-brand-600 text-white'
	};

	const sizes: Record<ButtonSize, string> = {
		xs: 'h-7 gap-1 rounded-md px-2 text-xs font-medium',
		sm: 'h-[34px] gap-1 rounded-md px-2 text-sm font-medium',
		md: 'h-[34px] gap-1.5 rounded-md px-4 text-sm',
		lg: 'h-[42px] gap-2 rounded-lg px-3 text-md',
		icon: 'size-[34px] justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
	};

	const iconSize = $derived(size === 'lg' ? 20 : size === 'xs' ? 14 : 18);
	const classes = $derived(
		cn(
			'inline-flex items-center justify-center whitespace-nowrap transition-colors select-none disabled:cursor-not-allowed',
			fullWidth ? 'w-full min-w-0 flex-1' : 'shrink-0',
			sizes[size],
			size === 'icon' ? '' : variants[variant],
			size === 'icon' && variant === 'outline-brand' && 'border-brand-500! text-brand-500!',
			loading && 'pointer-events-none opacity-80',
			className
		)
	);
</script>

{#snippet content()}
	{#if loading}
		<Spinner size={iconSize - 2} />
	{:else if icon}
		<Icon name={icon} size={iconSize} />
	{/if}
	{@render children?.()}
	{#if iconRight}<Icon name={iconRight} size={iconSize} />{/if}
{/snippet}

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render content()}</a>
{:else}
	<button
		class={classes}
		type="button"
		aria-busy={loading || undefined}
		{...rest as HTMLButtonAttributes}
		disabled={(rest as HTMLButtonAttributes).disabled || loading}
	>
		{@render content()}
	</button>
{/if}
