import type { IconName } from '#lib/constants/icons.ts';
import type { Visibility } from '#lib/types/index.ts';

export const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: IconName }[] = [
	{ value: 'private', label: 'Private', icon: 'lock' },
	{ value: 'workspace', label: 'Workspace', icon: 'contacts' },
	{ value: 'public', label: 'Public', icon: 'globe' }
];
