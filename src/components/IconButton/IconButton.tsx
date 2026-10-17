import type { ButtonHTMLAttributes } from "react";
import type { IconType } from "react-icons";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: IconType;
  /** Accessible name — required because the button has no visible text. */
  label: string;
  size?: number;
}

export default function IconButton({
  icon: Icon,
  label,
  size = 18,
  className = "",
  type = "button",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`relative grid size-9 place-items-center rounded-[9px] bg-transparent p-0 text-muted hover:bg-surface-2 hover:text-fg ${className}`.trim()}
      {...rest}
    >
      <Icon size={size} aria-hidden="true" />
      {children}
    </button>
  );
}
