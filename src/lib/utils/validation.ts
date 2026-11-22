import type { FormField } from '#lib/constants/forms.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormValues = Record<string, string>;
export type FormErrors = Record<string, string | undefined>;

/** Schema-driven validation for the generic form drawer. */
export function validate(fields: FormField[], values: FormValues): FormErrors {
	const errors: FormErrors = {};
	for (const f of fields) {
		const v = (values[f.name] ?? '').trim();
		if (f.required && !v) errors[f.name] = `${f.label} is required`;
		else if (v && f.type === 'email' && !EMAIL.test(v)) errors[f.name] = 'Enter a valid email address';
		else if (v && f.type === 'number' && (Number.isNaN(Number(v)) || Number(v) < 0)) errors[f.name] = 'Enter a positive number';
	}
	return errors;
}

/** Converts string form values into a typed payload (numbers stay numbers). */
export function toPayload(fields: FormField[], values: FormValues) {
	const out: Record<string, string | number> = {};
	for (const f of fields) {
		const v = values[f.name];
		if (v === undefined || v === '') continue;
		out[f.name] = f.type === 'number' ? Number(v) : v;
	}
	return out;
}
