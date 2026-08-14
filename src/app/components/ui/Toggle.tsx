interface ToggleProps {
  on: boolean;
  onChange: (value: boolean) => void;
}
export const Toggle:React.FC<ToggleProps> = ({ on, onChange }) => {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${on ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
      aria-checked={on}
      role="switch"
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}