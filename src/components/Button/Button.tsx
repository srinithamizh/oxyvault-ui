import type { ButtonHTMLAttributes } from "react";
import type { IconType } from "react-icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconType;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-[15px] py-2.5 text-[13px] font-[650] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-[0_5px_15px_color-mix(in_srgb,var(--accent)_18%,transparent)]",
  secondary: "border border-border bg-surface text-fg",
  ghost: "bg-transparent text-accent-dark",
  danger: "bg-danger text-white",
};

export default function Button({
  variant = "primary",
  icon: Icon,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...rest}
    >
      {Icon && <Icon size={17} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
