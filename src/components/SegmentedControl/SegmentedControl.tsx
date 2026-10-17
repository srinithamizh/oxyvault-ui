export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  name: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A compact single-choice control (radio group) for a handful of short options. */
export default function SegmentedControl<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold text-muted">{label}</legend>
      <div className="flex gap-1 rounded-[10px] border border-border bg-surface-2 p-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label key={option.value} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={`block rounded-[7px] px-3 py-2.5 text-center text-[13px] font-semibold peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[color-mix(in_srgb,var(--accent)_30%,transparent)] ${
                  selected ? "bg-surface text-accent-dark shadow-card" : "text-muted"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
