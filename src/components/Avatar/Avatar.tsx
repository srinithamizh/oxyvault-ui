import { getInitials } from "./getInitials";

export interface AvatarProps {
  name: string;
  className?: string;
}

export default function Avatar({ name, className = "" }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-[34px] flex-none place-items-center rounded-[10px] bg-accent-soft font-display text-[11px] font-bold text-accent-dark ${className}`.trim()}
    >
      {getInitials(name)}
    </span>
  );
}
