/** Per-field error messages for a form, keyed by field name. */
export type FieldErrors<T extends string> = Partial<Record<T, string>>;
