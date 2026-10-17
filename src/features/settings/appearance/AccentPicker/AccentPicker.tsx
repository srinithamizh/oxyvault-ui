import { useTranslation } from "react-i18next";
import { FiCheck } from "react-icons/fi";
import { ACCENTS } from "@/theme/accents/accents";
import { useTheme } from "@/hooks/useTheme/useTheme";

export default function AccentPicker() {
  const { t } = useTranslation();
  const { accent: current, setAccent } = useTheme();

  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] font-semibold text-muted">{t("settings.appearance.accentLegend")}</legend>
      <p className="mb-3 mt-1 text-[10px] text-muted">{t("settings.appearance.accentHint")}</p>

      {/* Always five equal columns so all colors stay on one row, even on a narrow phone. */}
      <div data-testid="accent-options" className="grid max-w-[420px] grid-cols-5 gap-2">
        {ACCENTS.map(({ id, labelKey, swatch }) => {
          const selected = current === id;
          return (
            <label key={id} className="flex cursor-pointer flex-col items-center gap-2">
              <input
                type="radio"
                name="accent-color"
                value={id}
                checked={selected}
                onChange={() => setAccent(id)}
                className="peer sr-only"
              />
              <span
                data-testid={`swatch-${id}`}
                style={{ backgroundColor: swatch }}
                className={`grid size-[34px] place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition-shadow peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color-mix(in_srgb,var(--accent)_30%,transparent)] ${
                  selected ? "ring-2 ring-fg" : "ring-0"
                }`}
              >
                {selected && <FiCheck size={16} aria-hidden="true" />}
              </span>
              <span className={`text-[11px] ${selected ? "font-semibold text-fg" : "text-muted"}`}>{t(labelKey)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
