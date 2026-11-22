import type { DropdownItem } from '../ui/dropdown/Dropdown.svelte';

/** Figma "Board Detail (Edit & Multi-Acc)" card action menu, in order. ("Mirror" is left out for now.) */
export const CARD_ACTIONS: DropdownItem[] = [
	{ value: 'open', label: 'Open card', icon: 'card' },
	{ value: 'labels', label: 'Edit labels', icon: 'tag' },
	{ value: 'members', label: 'Change members', icon: 'user' },
	{ value: 'cover', label: 'Change cover', icon: 'image' },
	{ value: 'dates', label: 'Edit dates', icon: 'clock' },
	{ value: 'move', label: 'Move', icon: 'arrowRight' },
	{ value: 'copy', label: 'Copy card', icon: 'copy' },
	{ value: 'link', label: 'Copy link', icon: 'link' },
	{ value: 'archive', label: 'Archive', icon: 'archive' }
];
