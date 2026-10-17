import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLElement>;

const base =
  "rounded-2xl border border-border bg-surface p-5 shadow-card transition-transform hover:border-[color-mix(in_srgb,var(--border)_65%,var(--accent))]";

export default function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <section className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </section>
  );
}
