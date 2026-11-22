/**
 * Debounced mirror of a reactive value — used for search inputs so typing
 * doesn't fire a request per keystroke.
 */
export function debounced<T>(source: () => T, ms = 350) {
	let value = $state(source());
	$effect(() => {
		const next = source();
		const id = setTimeout(() => (value = next), ms);
		return () => clearTimeout(id);
	});
	return {
		get current() {
			return value;
		}
	};
}
