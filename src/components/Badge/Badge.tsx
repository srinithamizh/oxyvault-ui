import type { HTMLAttributes } from "react";

export type BadgeTone = "success" | "danger" | "warning" | "neutral" | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const base = "inline-flex w-max items-center gap-1 rounded-full px-2 py-[5px] text-[10px] font-bold";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted",
  success: "bg-success-soft text-success-text",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning-text",
  accent: "border border-accent-dark bg-accent-soft text-accent-dark",
};

export default function Badge({ tone = "neutral", className = "", children, ...rest }: BadgeProps) {
  return (
    <span data-tone={tone} className={`${base} ${tones[tone]} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
