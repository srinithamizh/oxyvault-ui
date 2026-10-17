import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Content rendered inside the input on the right, e.g. a show/hide button. */
  endAdornment?: ReactNode;
}

export default function TextField({ label, error, endAdornment, className = "", ...rest }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-[9px] border bg-surface px-3 py-3 text-sm text-fg ${
            error ? "border-danger" : "border-border"
          } ${endAdornment ? "pr-14" : ""} ${className}`.trim()}
          {...rest}
        />
        {endAdornment && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] font-normal text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
