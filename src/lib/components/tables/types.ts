export type CellFormat = 'text' | 'status' | 'money' | 'number' | 'date' | 'view';

export interface Column<T> {
	key: keyof T & string;
	label: string;
	format?: CellFormat;
	/** Optional min width in px for horizontal scrolling on small screens. */
	minWidth?: number;
	align?: 'left' | 'center';
}
