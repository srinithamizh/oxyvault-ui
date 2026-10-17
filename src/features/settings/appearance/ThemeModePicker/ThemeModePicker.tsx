import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { useTheme, type ThemeMode } from "@/hooks/useTheme/useTheme";

const MODES: { mode: ThemeMode; icon: IconType }[] = [
  { mode: "light", icon: FiSun },
  { mode: "dark", icon: FiMoon },
  { mode: "system", icon: FiMonitor },
];

const previewSurface: Record<ThemeMode, string> = {
  light: "border-[#e4e8ea] bg-[#f5f7f8]",
  dark: "border-[#26332f] bg-[#111a17]",
  system: "border-[#e4e8ea] bg-[linear-gradient(90deg,#f5f7f8_50%,#111a17_50%)]",
};

/** A tiny, decorative mock-up of the app in the given mode. */
function ModePreview({ mode }: { mode: ThemeMode }) {
  const dark = mode === "dark";
  const rail = dark ? "border-[#26332f] bg-[#18231f]" : "border-[#e7e7e7] bg-white";
  const card = dark ? "bg-[#18231f]" : "bg-white";
  const heading = dark ? "bg-[#45534f]" : "bg-[#d4dcda]";

  return (
    <div
      aria-hidden="true"
      className={`relative flex h-[90px] flex-col gap-2 rounded-[7px] border py-[13px] pl-8 pr-2.5 ${previewSurface[mode]}`}
    >
      <span className={`absolute inset-y-0 left-0 w-6 border-r ${mode === "system" ? "bg-transparent" : rail}`} />
      <i className={`block h-2 w-3/5 rounded-[3px] ${heading}`} />
      <i className={`block h-4 rounded-[3px] ${card}`} />
      <i className={`block h-4 rounded-[3px] ${card}`} />
    </div>
  );
}

export default function ThemeModePicker() {
  const { t } = useTranslation();
  const { mode: current, setMode } = useTheme();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-[11px] font-semibold text-muted">{t("settings.appearance.modeLegend")}</legend>
      <div className="grid grid-cols-3 gap-[13px] max-[800px]:grid-cols-2 max-[520px]:grid-cols-1">
        {MODES.map(({ mode, icon: Icon }) => {
          const selected = current === mode;
          return (
            <label key={mode} className="block cursor-pointer">
              <input
                type="radio"
                name="theme-mode"
                value={mode}
                checked={selected}
                onChange={() => setMode(mode)}
                className="peer sr-only"
              />
              <span
                className={`block rounded-xl border-2 bg-transparent p-2 text-left text-fg transition-colors peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color-mix(in_srgb,var(--accent)_30%,transparent)] ${
                  selected ? "border-accent" : "border-border"
                }`}
              >
                <ModePreview mode={mode} />
                <span className="flex items-center gap-[7px] px-1 pb-[3px] pt-2 text-[11px] font-semibold">
                  <Icon size={18} aria-hidden="true" />
                  {t(`settings.appearance.modes.${mode}`)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
