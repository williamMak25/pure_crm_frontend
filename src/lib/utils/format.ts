const number = new Intl.NumberFormat('en-US');

export const formatNumber = (n: number) => number.format(n);

/** "1,200,000 MMK" — the currency format used across the Figma file. */
export const formatMoney = (n: number, currency = 'MMK') => `${number.format(n)} ${currency}`;

/** Compact form used in pipeline headers: 80,000 → "80,000 K" style in Figma is kept literal. */
export const formatThousandsK = (n: number) => `${number.format(n)} K`;

const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2026-10-15" → "15 Oct 2026", the date style used across the Figma file. */
export const formatDate = (iso: string | null | undefined) => (iso ? day.format(new Date(iso)) : '');

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "Just now", "5 minutes ago", "yesterday"… then a date after a week. */
export function formatRelative(iso: string | null | undefined) {
	if (!iso) return 'Never';
	const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
	const abs = Math.abs(seconds);
	if (abs < 60) return 'Just now';
	if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
	if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
	if (abs < 7 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
	return formatDate(iso.slice(0, 10));
}

export const initials = (name: string) =>
	name
		.split(/\s+/)
		.map((p) => p[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
