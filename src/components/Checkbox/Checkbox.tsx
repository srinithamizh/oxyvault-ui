import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: string;
}

export default function Checkbox({ label, error, ...rest }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-normal text-muted">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="accent-accent"
          {...rest}
        />
        {label}
      </label>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
