import { useId, useState, type ChangeEvent } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface DateTimePickerProps {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

function formatLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function parseLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return null;
  }
  return date;
}

function isValidTime(value: string, max: number): boolean {
  return /^\d{1,2}$/.test(value) && Number(value) >= 0 && Number(value) <= max;
}

function to24Hour(hour: number, period: "AM" | "PM"): number {
  if (hour === 12) return period === "AM" ? 0 : 12;
  return period === "PM" ? hour + 12 : hour;
}

export default function DateTimePicker({ label, value, required = false, onChange }: DateTimePickerProps) {
  const id = useId();
  const initialDate = parseLocalDateTime(value) ?? new Date();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate()),
  );
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const initialHour = initialDate.getHours();
  const [hour, setHour] = useState(String(initialHour % 12 || 12).padStart(2, "0"));
  const [minute, setMinute] = useState(String(initialDate.getMinutes()).padStart(2, "0"));
  const [period, setPeriod] = useState<"AM" | "PM">(initialHour >= 12 ? "PM" : "AM");

  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth);
  const selectedLabel = value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", hour12: true }).format(new Date(value))
    : "";
  const weekdays = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(2024, 0, day + 7)),
  );

  const updateTime = (nextHour: string, nextMinute: string) => {
    if (!isValidTime(nextHour, 12) || Number(nextHour) === 0 || !isValidTime(nextMinute, 59)) {
      onChange("");
      return;
    }
    const nextDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      to24Hour(Number(nextHour), period),
      Number(nextMinute),
    );
    onChange(formatLocalDateTime(nextDate));
  };

  const handleHourChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 2);
    setHour(nextValue);
    updateTime(nextValue, minute);
  };

  const handleMinuteChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 2);
    setMinute(nextValue);
    updateTime(hour, nextValue);
  };

  const chooseDay = (day: number) => {
    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    setSelectedDate(nextDate);
    if (isValidTime(hour, 12) && Number(hour) !== 0 && isValidTime(minute, 59)) {
      nextDate.setHours(to24Hour(Number(hour), period), Number(minute));
      onChange(formatLocalDateTime(nextDate));
    } else {
      onChange("");
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold text-muted">
        {label}
      </label>
      <button
        id={id}
        type="button"
        aria-label={`${label}${selectedLabel ? `: ${selectedLabel}` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required}
        data-value={value}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-[9px] border border-border bg-surface px-3 py-3 text-left text-sm text-fg outline-none transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span>{selectedLabel}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-muted" fill="none">
          <rect x="2.75" y="4.25" width="14.5" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.25 2.75v3M13.75 2.75v3M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full z-[150] mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-fg">{monthLabel}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdays.map((weekday, index) => (
              <span key={`${weekday}-${index}`} className="pb-2 text-[11px] font-medium text-muted">
                {weekday}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const isSelected =
                selectedDate.getFullYear() === visibleMonth.getFullYear() &&
                selectedDate.getMonth() === visibleMonth.getMonth() &&
                selectedDate.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
                  )}
                  onClick={() => chooseDay(day)}
                  className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    isSelected ? "bg-accent text-white" : "text-fg hover:bg-accent-soft hover:text-accent-dark"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 text-xs font-semibold text-muted">Time</div>
            <div className="flex items-center justify-between gap-1.5">
              <label className="sr-only" htmlFor={`${id}-hour`}>Hour</label>
              <input
                id={`${id}-hour`}
                aria-label="Hour"
                inputMode="numeric"
                value={hour}
                onChange={handleHourChange}
                className="h-9 w-12 rounded-lg border border-border bg-surface-2 text-center text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
                maxLength={2}
              />
              <span className="text-sm font-semibold text-muted">:</span>
              <label className="sr-only" htmlFor={`${id}-minute`}>Minute</label>
              <input
                id={`${id}-minute`}
                aria-label="Minute"
                inputMode="numeric"
                value={minute}
                onChange={handleMinuteChange}
                className="h-9 w-12 rounded-lg border border-border bg-surface-2 text-center text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
                maxLength={2}
              />
              <div role="group" aria-label="AM or PM" className="flex rounded-lg border border-border bg-surface-2 p-0.5">
                {(["AM", "PM"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={period === option}
                    onClick={() => {
                      setPeriod(option);
                      if (isValidTime(hour, 12) && Number(hour) !== 0 && isValidTime(minute, 59)) {
                        const nextDate = new Date(selectedDate);
                        nextDate.setHours(to24Hour(Number(hour), option), Number(minute));
                        onChange(formatLocalDateTime(nextDate));
                      } else {
                        onChange("");
                      }
                    }}
                    className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      period === option ? "bg-accent text-white" : "text-muted hover:text-fg"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
