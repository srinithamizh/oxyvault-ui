export interface SpinnerProps {
  size?: number;
  className?: string;
}

/** A purely decorative spinning ring; pair it with text or a labelled status for assistive tech. */
export default function Spinner({ size = 36, className = "" }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-block animate-spin rounded-full border-[3px] border-border border-t-accent motion-reduce:animate-none ${className}`.trim()}
    />
  );
}
