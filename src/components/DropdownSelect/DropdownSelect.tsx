import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export interface DropdownSelectOption {
  value: string;
  label: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openAbove: boolean;
}

interface DropdownSelectProps {
  label: string;
  value: string;
  options: DropdownSelectOption[];
  placeholder: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function DropdownSelect({
  label,
  value,
  options,
  placeholder,
  required = false,
  onChange,
}: DropdownSelectProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedMenuHeight = Math.min((options.length + 1) * 40 + 8, 248);
    const openAbove = rect.bottom + estimatedMenuHeight > window.innerHeight && rect.top > estimatedMenuHeight;
    setPosition({
      top: openAbove ? rect.top - 4 : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: rect.width,
      openAbove,
    });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  const focusOption = (index: number) => {
    const optionElements = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    optionElements?.[Math.max(0, Math.min(index, optionElements.length - 1))]?.focus();
  };

  const openMenu = () => {
    updatePosition();
    setOpen(true);
    requestAnimationFrame(() => {
      const selectedIndex = options.findIndex((option) => option.value === value) + 1;
      focusOption(selectedIndex >= 0 ? selectedIndex : 0);
    });
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const optionElements = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!optionElements?.length) return;
    const currentIndex = Array.from(optionElements).indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      focusOption((currentIndex + delta + optionElements.length) % optionElements.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(optionElements.length - 1);
    }
  };

  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;
  const allOptions = [{ value: "", label: placeholder }, ...options];

  return (
    <div className="flex flex-col gap-2 text-xs font-semibold text-muted">
      <span id={`${id}-label`}>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) openMenu();
          }
        }}
        className="flex w-full items-center justify-between gap-3 rounded-[9px] border border-border bg-surface px-3 py-3 text-left text-sm font-normal text-fg outline-none transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className={value ? "" : "text-muted"}>{selectedLabel}</span>
        <FiChevronDown
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>
      {open && position && createPortal(
        <div
          ref={menuRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          onKeyDown={handleMenuKeyDown}
          className={`fixed z-[250] max-h-60 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-card ${
            position.openAbove ? "-translate-y-full" : ""
          }`}
          style={{ top: position.top, left: position.left, width: position.width }}
        >
          {allOptions.map((option) => (
            <button
              key={option.value || "placeholder"}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                value === option.value
                  ? "bg-accent-soft font-semibold text-accent-dark"
                  : "text-fg hover:bg-surface-2"
              }`}
            >
              {option.label}
              {value === option.value && <FiCheck aria-hidden="true" size={15} />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
